import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RAGAS } from '../utils/ragaData';
import styles from './RagaLibrary.module.css';

export default function RagaLibrary({ onAskGuru }) {
  const [selected, setSelected] = useState(null);

  function openDetail(raga) { setSelected(raga); }
  function closeDetail() { setSelected(null); }
  function learnRaga(raga) {
    onAskGuru(`My Raga is ${raga.name}. Teach me how to sing it. Include Arohana, Avarohana, Gamakas, and a practice tip.`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroText}>
        <p className={styles.tag}>Melakarta · Janya · Raga Vidya</p>
        <h1 className={styles.title}>Raga <em>Library</em></h1>
        <p className={styles.sub}>
          Explore the melodic universe of Indian Classical music. Each raga is a living entity — a specific time, mood, and emotional world.
        </p>
      </div>

      <div className={styles.grid}>
        {RAGAS.map((raga, i) => (
          <motion.div
            key={raga.id}
            className={styles.card}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ y: -4 }}
          >
            <div className={styles.cardTop}>
              <span className={styles.melakarta}>{raga.melakarta}</span>
              <span className={styles.time}>⏱ {raga.time}</span>
            </div>
            <h2 className={styles.ragaName}>{raga.name}</h2>
            <p className={styles.mood}>✦ {raga.mood}</p>

            <div className={styles.notes}>
              {raga.notes.map((n) => (
                <span key={n} className={styles.note}>{n}</span>
              ))}
            </div>

            <p className={styles.desc}>{raga.desc}</p>

            <div className={styles.cardActions}>
              <button className={styles.detailBtn} onClick={() => openDetail(raga)}>
                View Detail
              </button>
              <button className={styles.guruBtn} onClick={() => learnRaga(raga)}>
                Ask Guru →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={closeDetail}>✕</button>
              <p className={styles.modalMelakarta}>{selected.melakarta}</p>
              <h2 className={styles.modalTitle}>{selected.name}</h2>
              <p className={styles.modalMood}>{selected.rasa}</p>

              <div className={styles.modalSection}>
                <span className={styles.sectionLabel}>AROHANA</span>
                <span className={styles.sectionValue}>{selected.arohana}</span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.sectionLabel}>AVAROHANA</span>
                <span className={styles.sectionValue}>{selected.avarohana}</span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.sectionLabel}>GAMAKAS</span>
                <span className={styles.sectionValue}>{selected.gamakas.join(' · ')}</span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.sectionLabel}>FAMOUS COMPOSITIONS</span>
                <span className={styles.sectionValue}>{selected.compositions.join(', ')}</span>
              </div>

              <button className={styles.modalGuruBtn} onClick={() => { learnRaga(selected); closeDetail(); }}>
                🧘 Get full Guru lesson on {selected.name}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
