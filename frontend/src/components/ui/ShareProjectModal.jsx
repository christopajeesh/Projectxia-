import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Linkedin,
  Twitter,
  Gift,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../../context/SoundContext';

const ShareProjectModal = ({ isOpen, onClose, project }) => {
  const { playClick, playSuccess } = useSound();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const shareUrl = `${window.location.origin}/projects/${project._id}?ref=ambassador_xia`;
  const shareTitle = `Check out this verified engineering blueprint: ${project.title} on ProjectXia!`;

  const handleCopyLink = () => {
    playClick();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform) => {
    playSuccess();
    confetti({ particleCount: 60, spread: 60 });

    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareTitle}\n\n👉 Complete KiCAD schematics, source code & 4K video walkthrough: ${shareUrl}`
      )}`;
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-mono text-xs">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-gray-950 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/25 z-10 text-left p-6 sm:p-7 space-y-5 text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400 text-cyan-300 shadow-neon-cyan">
                <Share2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white">
                  Share & Earn Ambassador Reward
                </h3>
                <p className="text-[10px] text-cyan-400">
                  Earn 10% cash commission on every referred purchase
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Project Preview Badge */}
          <div className="p-3.5 rounded-2xl bg-gray-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase">{project.category}</span>
            <h4 className="font-display font-bold text-sm text-white line-clamp-1">{project.title}</h4>
            <p className="text-[11px] text-slate-400">Price: ₹{Number(project.price || 0).toLocaleString('en-IN')}</p>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              1-Click Instant Social Dispatch:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSocialShare('whatsapp')}
                className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex flex-col items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px]">WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialShare('linkedin')}
                className="p-3 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 flex flex-col items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <Linkedin className="w-5 h-5 text-blue-400" />
                <span className="text-[10px]">LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialShare('twitter')}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center gap-1.5 transition-all cursor-pointer font-bold"
              >
                <Twitter className="w-5 h-5 text-slate-300" />
                <span className="text-[10px]">Twitter / X</span>
              </button>
            </div>
          </div>

          {/* Copy Referral Link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 uppercase font-bold">Your Unique Referral Link:</span>
              <span className="text-pink-400 font-bold flex items-center gap-1">
                <Gift className="w-3 h-3" /> 10% Cash Bounty
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-black border border-cyan-500/30 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-cyan-300 focus:outline-none text-[11px] truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 shrink-0 transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareProjectModal;
