import React from 'react';
import { motion } from 'framer-motion';
import { CONCEPTS } from '../utils/ragaData';
import styles from './Concepts.module.css';

const ADVANCED = [
  {
    title: 'Purvanga & Uttaranga',
    icon: '🎵',
    content: 'Every raga is divided into two tetrachords. The Purvanga (lower half: S to P) and Uttaranga (upper half: P to Ṡ). Mastery requires understanding how a raga\'s character shifts between these zones.',
  },
  {
    title: 'Sarali Varisais',
    icon: '📖',
    content: 'The foundational exercises of Karnatic music. Sung in all 7 swaras, they train Sruti accuracy, breath control, and vocal muscle memory. Every student begins here — no exceptions.',
  },
  {
    title: 'Gamaka Types',
    icon: '〰️',
    content: 'There are 15 classical Gamakas: Kampita (oscillation), Andolita (swing), Jaru (slide), Sphurita (flick), Nokku (touch), and more. Each raga uses specific Gamakas to express its unique personality.',
  },
  {
    title: 'The 72 Melakartas',
    icon: '🗂️',
    content: 'The Melakarta system organises all Karnatic ragas into 72 parent scales. Each is a unique arrangement of the 12 semitones. Janya ragas are derived from these by omitting or altering notes.',
  },
  {
    title: 'Kalpanaswaram',
    icon: '✨',
    content: 'Improvised solfège sung to swara names (Sa, Ri, Ga…). It tests a musician\'s real-time knowledge of a raga\'s grammar — which notes to emphasise, which to avoid, and which Gamakas to apply.',
  },
  {
    title: 'Manodharma Sangeetam',
    icon: '🎭',
    content: 'The art of improvisation in Karnatic music. Includes Alapana (free raga exploration), Niraval (melodic variation over a composition line), and Kalpanaswaram. This is where mastery becomes art.',
  },
];

export default function Concepts({ onAskGuru }) {
  return (
    <div className={styles.page}>
      <div className={styles.heroText}>
        <p className={styles.tag}>Theory · Technique · Tradition</p>
        <h1 className={styles.title}>Music <em>Concepts</em></h1>
        <p className={styles.sub}>Essential knowledge for any serious student of Indian Classical music.</p>
      </div>

      <h2 className={styles.sectionHead}>Core Terminology</h2>
      <div className={styles.termGrid}>
        {CONCEPTS.map((c, i) => (
          <motion.div
            key={c.term}
            className={styles.termCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <span className={styles.term}>{c.term}</span>
            <p className={styles.termMeaning}>{c.meaning}</p>
            <button className={styles.learnBtn} onClick={() => onAskGuru(`Explain ${c.term} in depth with examples from Karnatic music.`)}>
              Ask Guru →
            </button>
          </motion.div>
        ))}
      </div>

      <h2 className={styles.sectionHead} style={{ marginTop: 40 }}>Advanced Concepts</h2>
      <div className={styles.advGrid}>
        {ADVANCED.map((a, i) => (
          <motion.div
            key={a.title}
            className={styles.advCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
          >
            <span className={styles.advIcon}>{a.icon}</span>
            <h3 className={styles.advTitle}>{a.title}</h3>
            <p className={styles.advContent}>{a.content}</p>
            <button className={styles.learnBtn} onClick={() => onAskGuru(`Teach me about ${a.title} in Karnatic music with practical examples.`)}>
              Deep Dive with Guru →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
