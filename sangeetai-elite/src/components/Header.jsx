import React from 'react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <motion.header
      className={styles.header}
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.logo}>
        <div className={styles.logoMark}>🎵</div>
        <div>
          <div className={styles.logoText}>SangeetAI Elite</div>
          <div className={styles.logoSub}>Your Digital Guru</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {['Library', 'Studio', 'Concepts'].map((tab) => (
          <button
            key={tab}
            className={`${styles.navBtn} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.badge}>
        <span className={styles.dot} />
        Guru Online
      </div>
    </motion.header>
  );
}
