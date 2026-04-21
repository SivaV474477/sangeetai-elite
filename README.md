# 🎵 SangeetAI Elite

> Your AI Guru for Indian Classical Music — Karnatic & Hindustani

A premium, full-stack web platform featuring an AI Music Guru, audio analysis studio, and raga library — built with React, FastAPI, and Claude AI.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Guru Chat** | Persistent AI sidebar powered by Claude — answers questions about ragas, gamakas, talas, and technique |
| **Raga Library** | 6 Melakarta ragas with full detail: Arohana/Avarohana, Gamakas, Rasa, famous compositions |
| **Audio Studio** | Upload `.wav`/`.mp3` recordings for AI analysis of Sruti, Tala, Raga match, and Gamaka |
| **Concepts Page** | Core terminology and advanced concepts with one-click Guru explanations |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ — https://nodejs.org
- **Python** 3.10+ — https://python.org  *(optional, for backend audio analysis)*
- **Anthropic API key** — https://console.anthropic.com

### 1. Install & Configure

```bash
bash setup.sh
```

This installs all dependencies and creates your `.env` file.

### 2. Add your API key

Open `.env` and set your key:

```
REACT_APP_ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Run the app

**Frontend only** (browser-mode audio analysis):
```bash
npm start
```

**Frontend + Backend** (full pYIN pitch analysis):
```bash
# Terminal 1
npm start

# Terminal 2
source backend/.venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

Open **http://localhost:3000**

---

## 📁 Project Structure

```
sangeetai-elite/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Top navigation
│   │   ├── Header.module.css
│   │   ├── GuruChat.jsx       # Persistent AI chat sidebar
│   │   └── GuruChat.module.css
│   ├── pages/
│   │   ├── RagaLibrary.jsx    # Raga cards + detail modal
│   │   ├── RagaLibrary.module.css
│   │   ├── Studio.jsx         # Audio upload + analysis
│   │   ├── Studio.module.css
│   │   ├── Concepts.jsx       # Music theory reference
│   │   └── Concepts.module.css
│   ├── utils/
│   │   ├── ragaData.js        # Raga database
│   │   └── guruApi.js         # Anthropic API client
│   ├── styles/
│   │   └── global.css         # Design tokens + base styles
│   ├── App.jsx
│   └── index.js
├── backend/
│   ├── main.py                # FastAPI server with Librosa analysis
│   ├── requirements.txt
│   └── __init__.py
├── .env.example
├── package.json
├── setup.sh
└── README.md
```

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--obsidian` | `#0A0A0A` | Page background |
| `--gold` | `#D4AF37` | Primary accent, headings |
| `--gold-dim` | `#A8852A` | Gradient end, hover states |
| `--smoke` | `#F5F5F5` | Body text |
| `--eerie` | `#111111` | Sidebar background |
| `--card` | `#1E1E1E` | Card surfaces |

**Typography:** Playfair Display (serif headings) + DM Sans (body)

---

## 🔬 Audio Analysis

### Browser Mode (no backend needed)
Uses the **Web Audio API** to decode files and compute a rough RMS-based pitch estimate. Suitable for demonstrating the UI.

### Backend Mode (FastAPI + Librosa)
The Python backend uses **pYIN** (probabilistic YIN) — a research-grade pitch tracking algorithm — for accurate fundamental frequency (f₀) detection. Also computes:

- **Tempo / BPM** via `librosa.beat.beat_track`
- **Gamaka density** via pitch derivative sign-change rate
- **Raga match** via Jaccard similarity on detected pitch classes

---

## 🧘 AI Guru System Prompt

The Guru is configured as a **Vidwan** (master musician) with this personality:

- Answers with labeled sections: `AROHANA:`, `GAMAKAS:`, `RASA:`, `PRACTICE TIP:`
- Always includes Arohana/Avarohana for raga questions
- Explains Sanskrit terms with English translations
- Gives structured, actionable practice advice
- Maintains conversation history across the session

---

## 🛠 Extending the App

### Add more Ragas
Edit `src/utils/ragaData.js` — follow the existing schema.

### Add more Guru personas
Edit the `GURU_SYSTEM_PROMPT` in `src/utils/guruApi.js`.

### Improve pitch detection
In `backend/main.py`, tune the `pyin` parameters:
```python
f0, voiced_flag, _ = librosa.pyin(
    y,
    fmin=librosa.note_to_hz('C2'),
    fmax=librosa.note_to_hz('C7'),
    frame_length=2048,   # increase for better low-freq accuracy
    sr=sr,
)
```

---

## 📦 Dependencies

### Frontend
- `react` + `react-dom` — UI framework
- `framer-motion` — animations
- `axios` — HTTP client for backend calls
- `wavesurfer.js` — (optional) advanced waveform

### Backend
- `fastapi` + `uvicorn` — API server
- `librosa` — audio analysis (pYIN, beat tracking)
- `numpy` + `scipy` — numerical computation
- `python-multipart` — file upload handling

---

## 📄 License

MIT — build, learn, share.

---

*Dedicated to every student who ever sat before a Guru and asked: "Guruji, how do I sing this raga?"*
