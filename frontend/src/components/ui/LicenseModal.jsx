import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Download,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Printer,
  ExternalLink,
  Award,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../../context/SoundContext';

const LicenseModal = ({ isOpen, onClose, licenseData, project }) => {
  const { playSuccess, playClick } = useSound();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const data = licenseData || {
    licenseKey: 'XIA-LIC-A98B2C-2026',
    orderId: 'XIA-ORD-98234',
    projectId: project?._id || 'proj_001_retina_ai',
    projectTitle: project?.title || 'DiabeticRetina-AI: Deep CNN Node',
    buyerName: 'Verified Engineering Innovator',
    buyerEmail: 'innovator@projectxia.io',
    buyerInstitution: 'Indian Institute of Technology / R&D Labs',
    licenseType: 'Commercial Full Rights + IEEE Academic License',
    sha256Stamp: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  };

  const handleCopyKey = () => {
    playClick();
    navigator.clipboard.writeText(data.licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    playClick();
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl cursor-pointer"
        />

        {/* Certificate Holographic Modal Box */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-950 border-2 border-cyan-400/50 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/30 z-10 text-left p-6 sm:p-8 space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto"
        >
          {/* Certificate Top Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-400 text-cyan-300 shadow-neon-cyan">
                <Award className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                  Official Digital Certificate of Provenance
                </span>
                <h3 className="text-xl font-display font-black text-white">
                  ProjectXia Commercial License
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Certificate Main Body Parchment */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-gray-900/90 via-black to-gray-950 border border-cyan-500/30 font-mono text-xs space-y-4 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-8xl font-display font-black tracking-widest text-cyan-400 rotate-[-25deg]">
                PROJECTXIA
              </span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Licensed Work:</span>
                <h4 className="text-base font-display font-bold text-white mt-0.5">{data.projectTitle}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                ✓ VERIFIED ORIGINAL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Licensee / Buyer:</span>
                <p className="text-white font-bold">{data.buyerName}</p>
                <p className="text-[10px] text-slate-400">{data.buyerEmail}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Institution / Entity:</span>
                <p className="text-cyan-300 font-bold">{data.buyerInstitution || 'Engineering Enterprise'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">License Grant Scope:</span>
                <p className="text-emerald-400 font-bold">Commercial + Capstone Exclusivity</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Issued Timestamp:</span>
                <p className="text-slate-300">{new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Cryptographic SHA-256 Stamp */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[9px] text-slate-500 block uppercase">SHA-256 Cryptographic Integrity Hash:</span>
              <p className="text-[10px] text-cyan-400/80 break-all font-mono">
                {data.sha256Stamp || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
              </p>
            </div>
          </div>

          {/* License Key Box */}
          <div className="p-3.5 rounded-2xl bg-black border border-cyan-500/40 flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Digital License Key:</span>
              <span className="text-cyan-300 font-bold text-sm">{data.licenseKey}</span>
            </div>
            <button
              onClick={handleCopyKey}
              className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Print & Download Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-slate-700 text-white font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href={`/api/licenses/download/${data.licenseKey}`}
              onClick={() => {
                playSuccess();
                confetti({ particleCount: 60, spread: 60 });
              }}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all text-center"
            >
              <Download className="w-4 h-4" />
              <span>Download Vault ZIP</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LicenseModal;
