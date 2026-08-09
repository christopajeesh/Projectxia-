import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Maximize2, Shield, Radio, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, title, category, trustScore = 99 }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { playClick, playHover } = useSound();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Video Player Modal Box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-gray-950 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 z-10"
        >
          {/* Cyber HUD Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gray-900/90 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                VERIFIED PROTOTYPE VIDEO // {category || 'AI INTELLIGENCE'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-md text-[11px] font-mono text-cyan-300">
                <Shield className="w-3 h-3 text-cyan-400" />
                <span>INTEGRITY {trustScore}%</span>
              </div>

              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Container with Scanlines and Cyber Overlays */}
          <div className="relative aspect-video bg-black overflow-hidden group">
            <video
              src={videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4'}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />

            {/* Scanline CRT overlay */}
            <div className="scanline-overlay absolute inset-0 pointer-events-none" />

            {/* Top Right Live Telemetry */}
            <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-[11px] font-mono text-cyan-400 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
              <span>FPS: 60.0 | RES: 4K UHD</span>
            </div>

            {/* Bottom Title Bar */}
            <div className="absolute bottom-16 left-4 right-4 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-lg">
              <h3 className="text-lg font-bold font-display text-white">{title}</h3>
              <p className="text-xs text-slate-300 font-mono">Verified Architecture Build • Ready for Commercial Deployment</p>
            </div>

            {/* Player Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gray-950/90 border-t border-cyan-500/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs font-mono text-slate-400">00:14 / 01:30</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">
                  SHIELD_GUARD_OK
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VideoPlayerModal;
