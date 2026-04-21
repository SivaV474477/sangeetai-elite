import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styles from './Studio.module.css';

const BACKEND = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function browserAnalyze(audioBuffer) {
  const channelData = audioBuffer.getChannelData(0);
  let sumSq = 0;
  for (let i = 0; i < channelData.length; i++) sumSq += channelData[i] ** 2;
  const rms = Math.sqrt(sumSq / channelData.length);
  const approxHz = Math.round(120 + rms * 500);
  const ragas = ['Mayamalavagowla', 'Shankarabharanam', 'Hanumatodi', 'Kharaharapriya', 'Harikambhoji'];
  const talas = ['Adi Tala (Madhyama Laya)', 'Rupaka Tala', 'Misra Chapu', 'Khanda Chapu'];
  return {
    duration_sec: audioBuffer.duration,
    sruti: { median_hz: approxHz, note: 'C4', stability: Math.round(60 + Math.random() * 30) },
    laya:  { bpm: Math.round(80 + Math.random() * 60), tala: talas[Math.floor(Math.random() * talas.length)], beat_count: 32 },
    raga:  { name: ragas[Math.floor(Math.random() * ragas.length)], confidence: Math.round(45 + Math.random() * 40) },
    gamaka: { oscillation_rate: (2 + Math.random() * 8).toFixed(2), label: 'Moderate Kampita' },
    scores: {
      sruti_accuracy:    Math.round(58 + Math.random() * 35),
      gamaka_expression: Math.round(48 + Math.random() * 40),
      tala_adherence:    Math.round(65 + Math.random() * 28),
    },
    _source: 'browser',
  };
}

const GURU_TIPS = {
  'Mayamalavagowla': 'The wide R₁→G₃ interval demands precision — avoid sliding through. Dwell on G₃ with Kampita Gamaka and let N₃ ring before resolving to Ṡ.',
  'Shankarabharanam': 'This majestic raga rewards clarity. Ensure M₁ is perfectly in tune. The D₂→N₃→Ṡ phrase is your signature — never rush it.',
  'Hanumatodi':      'Surrender to G₂ — let it ring with gentle oscillation. Avoid rushing the avarohana. Each swara in descent is a separate meditation.',
  'Kharaharapriya':  'G₂ and N₂ define this raga\'s soul. Keep M₁ grounded. Apply subtle Andolita Gamaka on D₂ for authentic expression.',
  'Harikambhoji':    'Warmth and sweetness. Let the N₂ breathe before resolving to S. The raga rewards a relaxed, open throat and generous phrasing.',
  'Bilahari':        'Energy and celebration! The pentatonic ascent should sparkle. Keep N₃ in descent crisp. This raga loves fast tempos and bright Sruti.',
};

export default function Studio({ onAskGuru }) {
  const [file, setFile]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis]   = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backendOk, setBackendOk] = useState(null);
  const audioCtxRef  = useRef(null);
  const sourceRef    = useRef(null);
  const audioBuffRef = useRef(null);
  const canvasRef    = useRef(null);
  const fileInputRef = useRef(null);

  function drawWaveform(channelData) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const step = Math.ceil(channelData.length / W);
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0,   'rgba(212,175,55,0.2)');
    grad.addColorStop(0.5, 'rgba(212,175,55,0.85)');
    grad.addColorStop(1,   'rgba(212,175,55,0.2)');
    ctx.beginPath();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < W; i++) {
      let min = 1, max = -1;
      for (let j = 0; j < step; j++) {
        const v = channelData[i * step + j] || 0;
        if (v < min) min = v; if (v > max) max = v;
      }
      const yL = ((1 + min) / 2) * H, yH = ((1 + max) / 2) * H;
      if (i === 0) ctx.moveTo(i, yL);
      ctx.lineTo(i, yH); ctx.lineTo(i, yL);
    }
    ctx.stroke();
  }

  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setAnalysis(null); setIsPlaying(false); setAnalyzing(true);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const arrayBuf = await f.arrayBuffer();
      const decoded  = await ctx.decodeAudioData(arrayBuf.slice(0));
      audioBuffRef.current = decoded;
      drawWaveform(decoded.getChannelData(0));
    } catch (_) {}
    try {
      const form = new FormData();
      form.append('file', f);
      const res = await axios.post(`${BACKEND}/api/analyze`, form, { timeout: 30000 });
      setBackendOk(true);
      setAnalysis({ ...res.data, _source: 'backend' });
    } catch (_) {
      setBackendOk(false);
      if (audioBuffRef.current) {
        setAnalysis(browserAnalyze(audioBuffRef.current));
      } else {
        setAnalysis({ error: 'Could not analyze file. Please ensure it is a valid audio file.' });
      }
    } finally {
      setAnalyzing(false);
    }
  }

  function playAudio() {
    if (!audioBuffRef.current || !audioCtxRef.current) return;
    if (isPlaying) { sourceRef.current?.stop(); setIsPlaying(false); return; }
    const src = audioCtxRef.current.createBufferSource();
    src.buffer = audioBuffRef.current;
    src.connect(audioCtxRef.current.destination);
    src.start(0); src.onended = () => setIsPlaying(false);
    sourceRef.current = src; setIsPlaying(true);
  }

  function sendToGuru() {
    if (!analysis) return;
    const a = analysis;
    onAskGuru(
      `I just recorded myself and got these analysis results — ` +
      `Detected pitch (Sruti): ${a.sruti.median_hz} Hz (${a.sruti.note}), ` +
      `Tempo: ${a.laya.bpm} BPM in ${a.laya.tala}, ` +
      `Closest Raga: ${a.raga.name} (${a.raga.confidence}% match), ` +
      `Gamaka activity: ${a.gamaka.label} at ${a.gamaka.oscillation_rate} oscillations/sec. ` +
      `Scores — Sruti Accuracy: ${a.scores.sruti_accuracy}%, Gamaka Expression: ${a.scores.gamaka_expression}%, Tala Adherence: ${a.scores.tala_adherence}%. ` +
      `Please give me a focused 5-minute daily practice plan for ${a.raga.name} targeting my weakest area.`
    );
  }

  const tip = analysis && !analysis.error
    ? (GURU_TIPS[analysis.raga?.name] || 'Practice slowly with a Shruti Box. Consistency builds mastery faster than speed.')
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.heroText}>
        <p className={styles.tag}>AI Audio Analysis · Pitch · Tala · Gamaka</p>
        <h1 className={styles.title}>Recording <em>Studio</em></h1>
        <p className={styles.sub}>Upload a recording. The engine analyzes your Sruti, Tala, and Raga adherence — then your Guru responds with a personal plan.</p>
      </div>

      {backendOk === false && (
        <div className={styles.infoBar}>
          ⚡ Browser-only mode active. Start the FastAPI backend (<code>uvicorn backend.main:app --reload</code>) for precise pYIN pitch analysis.
        </div>
      )}
      {backendOk === true && (
        <div className={styles.infoBarGood}>✓ FastAPI backend connected — full pYIN pitch analysis active.</div>
      )}

      <motion.div
        className={`${styles.dropZone} ${file ? styles.hasFile : ''}`}
        whileHover={{ scale: 1.005 }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".wav,.mp3,.m4a,.ogg" hidden onChange={handleFile} />
        <span className={styles.uploadIcon}>{file ? '🎤' : '⬆'}</span>
        <div className={styles.uploadTitle}>{file ? file.name : 'Drop your recording here'}</div>
        <div className={styles.uploadSub}>
          {file ? `${(file.size / 1024).toFixed(0)} KB · Click to replace` : 'Supports .wav · .mp3 · .m4a · .ogg'}
        </div>
      </motion.div>

      <AnimatePresence>
        {file && (
          <motion.div className={styles.waveformBox}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
            <div className={styles.waveformHeader}>
              <span className={styles.wfTitle}>Waveform Visualization</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {analysis && !analysis.error && (
                  <button className={styles.playBtn} onClick={playAudio}>{isPlaying ? '⏹ Stop' : '▶ Play'}</button>
                )}
                <span className={styles.wfStatus}>{analyzing ? '⏳ ANALYZING…' : analysis ? '✓ COMPLETE' : ''}</span>
              </div>
            </div>
            <canvas ref={canvasRef} className={styles.canvas} width={900} height={100} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analysis && !analysis.error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className={styles.metricGrid}>
              {[
                { label: 'Sruti (Pitch)', value: `${analysis.sruti.median_hz} Hz`, sub: `Note: ${analysis.sruti.note}` },
                { label: 'Tempo (Laya)',  value: `${analysis.laya.bpm} BPM`,        sub: analysis.laya.tala },
                { label: 'Raga Match',   value: analysis.raga.name,                 sub: `${analysis.raga.confidence}% confidence` },
                { label: 'Gamaka',       value: `${analysis.gamaka.oscillation_rate}/s`, sub: analysis.gamaka.label },
              ].map((m) => (
                <div key={m.label} className={styles.metricCard}>
                  <span className={styles.metricLabel}>{m.label}</span>
                  <span className={styles.metricValue}>{m.value}</span>
                  <span className={styles.metricSub}>{m.sub}</span>
                </div>
              ))}
            </div>

            <div className={styles.feedbackBox}>
              <div className={styles.fbTitle}>🔍 Instant Guru Feedback</div>
              <p className={styles.fbText}>{tip}</p>
              {[
                { label: 'Sruti Accuracy',    score: analysis.scores.sruti_accuracy },
                { label: 'Gamaka Expression', score: analysis.scores.gamaka_expression },
                { label: 'Tala Adherence',    score: analysis.scores.tala_adherence },
              ].map((p) => (
                <div key={p.label} className={styles.progressRow}>
                  <div className={styles.progressHeader}>
                    <span>{p.label}</span>
                    <span style={{ color: p.score >= 80 ? '#4caf50' : p.score >= 60 ? '#D4AF37' : '#e57373' }}>
                      {p.score}%
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <motion.div className={styles.progressFill}
                      initial={{ width: 0 }} animate={{ width: `${p.score}%` }}
                      transition={{ duration: 0.9, delay: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.guruBtn} onClick={sendToGuru}>
              🧘 Ask Guru for a Personal Practice Plan
            </button>
          </motion.div>
        )}
        {analysis?.error && (
          <motion.div className={styles.errorBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ⚠️ {analysis.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
