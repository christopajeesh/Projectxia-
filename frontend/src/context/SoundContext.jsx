import React, { createContext, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('projectxia_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    localStorage.setItem('projectxia_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const initAudio = () => {
    if (!audioCtx && typeof window !== 'undefined') {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(ctx);
      return ctx;
    }
    return audioCtx;
  };

  const playBlip = (freq = 800, type = 'sine', duration = 0.05, gainValue = 0.05) => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio() || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Graceful fallback
    }
  };

  const playClick = () => playBlip(1200, 'triangle', 0.04, 0.08);
  const playHover = () => playBlip(480, 'sine', 0.03, 0.03);
  const playShield = () => {
    if (!soundEnabled) return;
    playBlip(320, 'sawtooth', 0.15, 0.08);
    setTimeout(() => playBlip(980, 'sine', 0.2, 0.06), 80);
  };
  const playSuccess = () => {
    if (!soundEnabled) return;
    playBlip(523.25, 'sine', 0.1, 0.08); // C5
    setTimeout(() => playBlip(659.25, 'sine', 0.1, 0.08), 80); // E5
    setTimeout(() => playBlip(783.99, 'sine', 0.15, 0.08), 160); // G5
  };

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        isMuted: !soundEnabled,
        toggleMute: () => setSoundEnabled(prev => !prev),
        toggleSound: () => setSoundEnabled(prev => !prev),
        playClick,
        playHover,
        playShield,
        playSuccess,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
