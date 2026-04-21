import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header      from './components/Header';
import GuruChat    from './components/GuruChat';
import RagaLibrary from './pages/RagaLibrary';
import Studio      from './pages/Studio';
import Concepts    from './pages/Concepts';
import styles      from './App.module.css';

const PAGE_ANIM = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Library');
  const pendingRef = useRef(null);
  const [guruTick, setGuruTick] = useState(0);

  function pushToGuru(text) {
    pendingRef.current = text;
    setGuruTick((t) => t + 1);
  }

  return (
    <div className={styles.app}>

      {/* ── Global fullscreen video background ── */}
      <div className={styles.videoBg}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.bgVideo}
          poster={process.env.PUBLIC_URL + "/media/studio-hero.jpg"}
        >
          <source src={process.env.PUBLIC_URL + "/media/studio-video.mp4"} type="video/mp4" />
        </video>
        {/* Dark overlay so text stays readable */}
        <div className={styles.bgOverlay} />
      </div>

      {/* ── All UI sits above the video ── */}
      <div className={styles.uiLayer}>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className={styles.body}>
          <main className={styles.main}>
            <AnimatePresence mode="wait">
              {activeTab === 'Library' && (
                <motion.div key="library" {...PAGE_ANIM} style={{ height: '100%' }}>
                  <RagaLibrary onAskGuru={pushToGuru} />
                </motion.div>
              )}
              {activeTab === 'Studio' && (
                <motion.div key="studio" {...PAGE_ANIM} style={{ height: '100%' }}>
                  <Studio onAskGuru={pushToGuru} />
                </motion.div>
              )}
              {activeTab === 'Concepts' && (
                <motion.div key="concepts" {...PAGE_ANIM} style={{ height: '100%' }}>
                  <Concepts onAskGuru={pushToGuru} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <GuruChat
            key="guru-persistent"
            pendingMessage={guruTick > 0 ? pendingRef.current : null}
            guruTick={guruTick}
          />
        </div>
      </div>

    </div>
  );
}
