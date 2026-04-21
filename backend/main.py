"""
SangeetAI Elite — FastAPI Backend
Audio analysis using Librosa: pitch (pYIN), tempo, and raga matching.

Install dependencies:
    pip install fastapi uvicorn python-multipart librosa numpy scipy

Run:
    uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
import io
import tempfile
import os
from typing import Optional

app = FastAPI(title="SangeetAI Elite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Raga Note Profiles (Hz, 12-TET from C4=261.63) ──────────────────────
RAGA_PROFILES = {
    "Mayamalavagowla": [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88],
    "Shankarabharanam": [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
    "Hanumatodi":      [261.63, 277.18, 311.13, 349.23, 392.00, 415.30, 466.16],
    "Kharaharapriya":  [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 466.16],
    "Harikambhoji":    [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 466.16],
    "Bilahari":        [261.63, 293.66, 329.63, 392.00, 440.00, 523.25],
}

TALA_BEATS = {
    "Adi Tala":       8,
    "Rupaka Tala":    6,
    "Misra Chapu":    7,
    "Khanda Chapu":   5,
    "Ata Tala":      14,
}


def freq_to_note_class(freq: float) -> int:
    """Convert frequency to pitch class (0-11, C=0)."""
    if freq <= 0:
        return -1
    midi = 12 * np.log2(freq / 440.0) + 69
    return int(round(midi)) % 12


def match_raga(pitches: np.ndarray) -> tuple[str, float]:
    """
    Compare detected pitch classes to raga profiles.
    Returns (raga_name, confidence_score).
    """
    detected_classes = set()
    for p in pitches:
        if p > 50:
            nc = freq_to_note_class(p)
            if nc >= 0:
                detected_classes.add(nc)

    best_raga = "Unknown"
    best_score = 0.0

    for raga_name, raga_freqs in RAGA_PROFILES.items():
        raga_classes = set(freq_to_note_class(f) for f in raga_freqs)
        if not raga_classes:
            continue
        intersection = detected_classes & raga_classes
        # Jaccard similarity
        union = detected_classes | raga_classes
        score = len(intersection) / len(union) if union else 0
        if score > best_score:
            best_score = score
            best_raga = raga_name

    return best_raga, round(best_score * 100, 1)


def detect_tala(tempo: float) -> str:
    """Heuristic: map BPM ranges to common Talas."""
    if tempo < 60:
        return "Adi Tala (Vilamba Laya)"
    elif tempo < 90:
        return "Adi Tala (Madhyama Laya)"
    elif tempo < 120:
        return "Rupaka Tala"
    elif tempo < 150:
        return "Misra Chapu"
    else:
        return "Khanda Chapu (Druta Laya)"


def analyze_gamaka(pitches: np.ndarray, sr: int = 22050) -> dict:
    """
    Detect Gamaka (pitch oscillations) by measuring frequency of
    sign changes in the pitch derivative.
    Returns oscillation_rate and a qualitative label.
    """
    valid = pitches[pitches > 50]
    if len(valid) < 10:
        return {"oscillation_rate": 0, "label": "Insufficient data"}

    diff = np.diff(valid)
    sign_changes = np.sum(np.diff(np.sign(diff)) != 0)
    rate = sign_changes / (len(valid) / sr * 512)  # per second approx

    if rate < 2:
        label = "Sparse — minimal Gamaka detected"
    elif rate < 6:
        label = "Moderate Kampita (gentle oscillation)"
    elif rate < 12:
        label = "Rich Gamaka — good oscillation depth"
    else:
        label = "Very active — consider slowing for clarity"

    return {"oscillation_rate": round(rate, 2), "label": label}


@app.get("/")
def root():
    return {"status": "SangeetAI Elite API is running", "version": "1.0.0"}


@app.post("/api/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    """
    Main audio analysis endpoint.
    Accepts .wav / .mp3 / .m4a files.
    Returns: pitch (sruti), tempo (laya), raga match, gamaka analysis.
    """
    if not file.filename:
        raise HTTPException(400, "No file provided")

    allowed = {".wav", ".mp3", ".m4a", ".ogg", ".flac"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type: {ext}. Use {allowed}")

    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 50 MB.")

    try:
        # Write to temp file so librosa can read it
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        y, sr = librosa.load(tmp_path, sr=22050, mono=True, duration=60)
        os.unlink(tmp_path)

        # ── Pitch (pYIN) ──────────────────────────────────────────────
        f0, voiced_flag, voiced_probs = librosa.pyin(
            y,
            fmin=librosa.note_to_hz("C2"),
            fmax=librosa.note_to_hz("C7"),
            sr=sr,
        )
        f0_clean = f0[voiced_flag] if voiced_flag is not None else f0
        f0_clean = f0_clean[~np.isnan(f0_clean)]

        median_pitch = float(np.median(f0_clean)) if len(f0_clean) > 0 else 0.0
        pitch_stability = float(1 - (np.std(f0_clean) / (median_pitch + 1e-6))) if len(f0_clean) > 0 else 0.0
        pitch_stability = max(0, min(1, pitch_stability))

        # ── Tempo / BPM ──────────────────────────────────────────────
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        tempo_val = float(tempo) if np.isscalar(tempo) else float(tempo[0])

        # ── Raga Match ───────────────────────────────────────────────
        raga_name, raga_confidence = match_raga(f0_clean)

        # ── Gamaka ───────────────────────────────────────────────────
        gamaka = analyze_gamaka(f0_clean, sr)

        # ── Scores ───────────────────────────────────────────────────
        sruti_score  = round(min(100, pitch_stability * 100 * 1.1))
        gamaka_score = round(min(100, raga_confidence * 0.6 + gamaka["oscillation_rate"] * 4))
        tala_score   = round(min(100, 60 + (len(beats) / (len(y) / sr + 1e-6)) * 5))

        return {
            "filename":        file.filename,
            "duration_sec":    round(len(y) / sr, 2),
            "sruti": {
                "median_hz":   round(median_pitch, 2),
                "note":        librosa.hz_to_note(median_pitch) if median_pitch > 0 else "N/A",
                "stability":   round(pitch_stability * 100, 1),
            },
            "laya": {
                "bpm":         round(tempo_val, 1),
                "tala":        detect_tala(tempo_val),
                "beat_count":  len(beats),
            },
            "raga": {
                "name":        raga_name,
                "confidence":  raga_confidence,
            },
            "gamaka":          gamaka,
            "scores": {
                "sruti_accuracy":    sruti_score,
                "gamaka_expression": gamaka_score,
                "tala_adherence":    tala_score,
            },
        }

    except Exception as e:
        raise HTTPException(500, f"Audio analysis failed: {str(e)}")


@app.get("/api/ragas")
def get_ragas():
    """Return all raga profiles."""
    return {"ragas": list(RAGA_PROFILES.keys())}
