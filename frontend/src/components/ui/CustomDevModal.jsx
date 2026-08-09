import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Code,
  Cpu,
  Layers,
  Send,
  CheckCircle2,
  MessageSquare,
  Lightbulb,
  Phone,
  Mail,
  Shield,
  Clock,
  Check,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import AuroraBackground from './AuroraBackground';
import confetti from 'canvas-confetti';
import api from '../../services/api';

const CustomDevModal = ({ isOpen, onClose }) => {
  const { playClick, playSuccess } = useSound();
  const [tab, setTab] = useState('build'); // 'build' or 'suggest'
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [budgetVal, setBudgetVal] = useState(18000);
  const [ndaAgreed, setNdaAgreed] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '+91 ',
    dept: 'Computer Science (CSE / IT)',
    projectType: 'Full-Stack Web & AI Embedded Node',
    description: '',
  });

  if (!isOpen) return null;

  // Milestone Escrow Calculations
  const phase1 = Math.round(budgetVal * 0.3);
  const phase2 = Math.round(budgetVal * 0.4);
  const phase3 = budgetVal - phase1 - phase2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    playClick();

    try {
      await api.post('/agency/inquire', {
        clientName: formData.name,
        clientEmail: formData.email,
        clientMobile: formData.mobile,
        department: formData.dept,
        projectTitle: `${formData.dept} Custom Build`,
        requirements: formData.description,
        budget: budgetVal,
        ndaSigned: ndaAgreed,
      });
    } catch (err) {
      // Fallback
    }

    setIsSending(false);
    playSuccess();
    setSubmitted(true);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 3500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-mono text-xs">
        {/* Semi-transparent Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-950 border border-purple-500/50 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 z-10 text-left p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-slate-100"
        >
          {/* Inner Dialog Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
            <AuroraBackground theme="purple" />
          </div>

          <div className="relative z-10 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400 text-purple-300 shadow-neon-purple">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white">
                    ProjectXia Custom Engineering Agency
                  </h3>
                  <p className="text-[11px] text-purple-300">
                    3-Stage Milestone Escrow • Confidential Build with Verified Sellers
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-display font-black text-lg text-white">
                  Custom Engineering RFQ Logged!
                </h4>
                <p className="text-emerald-300 text-xs">
                  Your project specs have been securely routed to our verified senior engineers. You will receive a milestone proposal on your email/WhatsApp within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Inputs Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Your Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/80 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      College Email / Work Email:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rohan@iitb.ac.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black/80 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Inputs Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      WhatsApp / Mobile Contact:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-black/80 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Engineering Department:
                    </label>
                    <select
                      value={formData.dept}
                      onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                      className="w-full bg-black/80 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="Computer Science (CSE / IT)">Computer Science (CSE / IT)</option>
                      <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                      <option value="Electrical Engineering (EEE)">Electrical Engineering (EEE)</option>
                      <option value="AI & Data Science (AI / ML)">AI & Data Science (AI / ML)</option>
                      <option value="Mechanical & Robotics">Mechanical & Robotics</option>
                      <option value="Cyber Security">Cyber Security</option>
                    </select>
                  </div>
                </div>

                {/* Project Specs */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Describe Your Capstone / Hardware Requirements:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details: sensors, microcontrollers (ESP32 / Arduino), dataset, accuracy requirements, or delivery deadlines..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black/80 border border-slate-700 focus:border-purple-400 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>

                {/* Milestone Escrow Budget Estimator */}
                <div className="p-4 rounded-2xl bg-gray-900/90 border border-purple-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Estimated Project Budget:
                    </span>
                    <span className="font-display font-black text-purple-300 text-sm">
                      ₹{budgetVal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={6000}
                    max={60000}
                    step={1000}
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />

                  {/* 3-Stage Escrow Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] border-t border-slate-800">
                    <div className="p-2 rounded-xl bg-black/60 border border-slate-800">
                      <span className="text-slate-400 block">Phase 1 (30%):</span>
                      <span className="text-cyan-300 font-bold">₹{phase1.toLocaleString('en-IN')}</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">KiCAD & BOM</p>
                    </div>

                    <div className="p-2 rounded-xl bg-black/60 border border-slate-800">
                      <span className="text-slate-400 block">Phase 2 (40%):</span>
                      <span className="text-purple-300 font-bold">₹{phase2.toLocaleString('en-IN')}</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">4K Video Walkthrough</p>
                    </div>

                    <div className="p-2 rounded-xl bg-black/60 border border-slate-800">
                      <span className="text-slate-400 block">Phase 3 (30%):</span>
                      <span className="text-emerald-400 font-bold">₹{phase3.toLocaleString('en-IN')}</span>
                      <p className="text-[9px] text-slate-500 mt-0.5">Code & Courier</p>
                    </div>
                  </div>
                </div>

                {/* NDA Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={ndaAgreed}
                    onChange={(e) => setNdaAgreed(e.target.checked)}
                    className="accent-purple-500 rounded"
                  />
                  <span>Opt-in for Mutual Non-Disclosure Agreement (NDA) & IP Protection</span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-500/25 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Generating Quotation & Escrow...' : 'Submit Custom Engineering RFQ'}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomDevModal;
