import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

const InitialLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsLoading(false);
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 10);
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="initial-loader"
          initial={{ opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030303] text-white overflow-hidden select-none font-sans"
        >
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Ambient Glow Aura */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[150px] animate-pulse-slow" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[#00ffaa]/15 blur-[150px] animate-aurora-glow" />

          {/* Center Brand & Loader Badge */}
          <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-[#00ffaa] text-black shadow-[0_0_40px_rgba(0,255,170,0.3)] border border-[#00ffaa]/40"
            >
              <Shield className="w-10 h-10 text-black" />
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-white animate-spin" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-1"
            >
              <h2 className="text-3xl font-display font-black tracking-tight text-white">
                PROJECT<span className="text-[#00ffaa]">XIA</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] animate-ping" />
                <span>Next-Gen Engineering Hub</span>
              </p>
            </motion.div>

            {/* High-Tech Progress Bar */}
            <div className="w-full space-y-2 pt-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>SYNTHESIZING MATRIX</span>
                <span className="text-[#00ffaa] font-bold">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-[#00ffaa] rounded-full shadow-[0_0_15px_rgba(0,255,170,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InitialLoader;
