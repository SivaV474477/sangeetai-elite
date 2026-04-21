import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header    from './components/Header';
import GuruChat  from './components/GuruChat';
import RagaLibrary from './pages/RagaLibrary';
import Studio    from './pages/Studio';
import Concepts  from './pages/Concepts';
import styles    from './App.module.css';

const PAGE_ANIM = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Library');
  // Shared channel: main pages push messages to GuruChat
  const pendingRef = useRef(null);
  const [guruTick, setGuruTick] = useState(0);

  function pushToGuru(text) {
    pendingRef.current = text;
    setGuruTick((t) => t + 1); // trigger re-render so GuruChat sees it
  }

  return (
    <div className={styles.app}>
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
  );
}
