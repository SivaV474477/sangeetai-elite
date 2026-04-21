import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askGuru } from '../utils/guruApi';
import styles from './GuruChat.module.css';

const SUGGESTIONS = [
  'How do I begin learning Karnatic music?',
  'Teach me Mayamalavagowla raga',
  'What are Gamakas and how do I practice them?',
  'Explain Adi Tala to me',
  'What is the difference between Carnatic and Hindustani music?',
];

function formatGuruText(text) {
  // Bold section labels like "AROHANA:", "GAMAKAS:" etc.
  return text.replace(/([A-Z][A-Z\s]+:)/g, '<strong class="label">$1</strong>');
}

export default function GuruChat({ pendingMessage, guruTick }) {
  const [messages, setMessages] = useState([
    {
      role: 'guru',
      text: 'Namaskaram 🙏 I am your Karnatic and Hindustani music Guru. Ask me about any Raga, Gamaka, Tala, or technique — or upload a recording in the Studio for personal analysis.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const prevTickRef = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Receive injected messages from Library / Studio pages
  useEffect(() => {
    if (guruTick > 0 && guruTick !== prevTickRef.current && pendingMessage) {
      prevTickRef.current = guruTick;
      sendMessage(pendingMessage);
    }
  }, [guruTick, pendingMessage]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await askGuru(msg, history);
      const guruMsg = { role: 'guru', text: reply };
      setMessages((prev) => [...prev, guruMsg]);
      setHistory((prev) => [
        ...prev,
        { role: 'user', content: msg },
        { role: 'assistant', content: reply },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'guru', text: `⚠️ ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.title}>Guru Chat</div>
        <div className={styles.sub}>Ask anything about Indian Classical Music</div>
      </div>

      <div className={styles.messages}>
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              className={`${styles.msg} ${styles[m.role]}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {m.role === 'guru' && <span className={styles.msgTag}>✦ GURU</span>}
              <div
                className={styles.bubble}
                dangerouslySetInnerHTML={{ __html: formatGuruText(m.text) }}
              />
            </motion.div>
          ))}
          {loading && (
            <motion.div
              className={`${styles.msg} ${styles.guru}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className={styles.msgTag}>✦ GURU</span>
              <div className={styles.bubble}>
                <span className={styles.dots}>
                  <span /><span /><span />
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className={styles.suggestions}>
        {SUGGESTIONS.slice(0, 3).map((s) => (
          <button key={s} className={styles.suggestion} onClick={() => sendMessage(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your Guru…"
        />
        <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={loading}>
          ↑
        </button>
      </div>
    </aside>
  );
}
