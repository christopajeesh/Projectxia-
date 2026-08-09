import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  PhoneCall,
  Lightbulb,
  Send,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  Calendar,
  Layers,
  Code,
  Cpu,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  FileText,
  Mail,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';

const CustomSoftwareRequestModal = ({ isOpen, onClose, onInquirySubmitted }) => {
  const { playClick, playSuccess } = useSound();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Clean Single Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    projectTitle: '',
    requirements: '',
    targetDeadline: '2-3 Weeks (Standard)',
    budgetRange: '₹15,000 - ₹30,000',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();

    if (!formData.mobile) {
      alert('Please provide your phone or WhatsApp number so our engineering lead can reach you.');
      return;
    }

    if (!formData.requirements && !formData.projectTitle) {
      alert('Please provide a brief description of what you want to build.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        clientName: formData.name || user?.name || 'Software Client',
        clientEmail: formData.email || user?.email || 'client@projectxia.io',
        clientMobile: formData.mobile || user?.mobile || '',
        projectTitle: formData.projectTitle || 'Custom Software Project',
        requirements: formData.requirements || 'Custom Software Build Request',
        targetDeadline: formData.targetDeadline,
        budgetRange: formData.budgetRange,
        type: 'IDEA_SUBMISSION',
      };

      const res = await api.post('/agency/share-idea-callback', payload);

      playSuccess();
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
      setSubmittedResult(res.data.inquiry);

      if (onInquirySubmitted) {
        onInquirySubmitted(res.data.inquiry);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-950/95 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/25 z-10 my-6 max-h-[92vh] flex flex-col backdrop-blur-3xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border-b border-cyan-500/25">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-neon-cyan shrink-0">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-display font-black text-white">
                    Build Custom Software
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/50 font-bold uppercase">
                    In-House Team
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Direct copy to <strong className="text-cyan-300 font-bold">theprojectxia@gmail.com</strong></span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playClick();
                handleResetAndClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 font-sans">
            {submittedResult ? (
              /* Success View */
              <div className="py-6 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-display font-black text-white">
                    Project Idea Received!
                  </h3>
                  <p className="text-xs font-mono text-slate-300 max-w-md mx-auto leading-relaxed">
                    Our Core Engineering Team has received your project specs at theprojectxia@gmail.com. We will analyze your requirements and reach out to you directly.
                  </p>
                </div>

                <div className="max-w-sm mx-auto p-4 rounded-2xl bg-gray-900/90 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-500">Contact:</span>
                    <span className="text-cyan-300 font-bold">{formData.mobile || formData.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-500">Assigned Team:</span>
                    <span className="text-emerald-400">ProjectXia Developing Team</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-yellow-400 font-bold">🔍 In Lead Review</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    Done • Back to Website
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 font-mono text-xs">
                {/* Intro banner */}
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-cyan-200">Have a custom idea, thesis, or startup MVP?</span> Tell us what you want to build. Our in-house developers will code, test, and deliver your project with full source code & documentation.
                </div>

                {/* Contact info (2 fields) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-bold text-[11px]">Your Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-bold text-[11px]">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="Enter phone or WhatsApp number"
                      className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold text-[11px]">
                    Software Title or Project Concept
                  </label>
                  <input
                    type="text"
                    value={formData.projectTitle}
                    onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                    placeholder="e.g. AI Medical App, IoT Smart Grid, E-Commerce SaaS"
                    className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold text-[11px]">
                    What do you want us to build? (Features, tech, or guidelines) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Briefly describe what the project should do, any specific technology you want (React, Python, Node, Flutter, etc.), and university or startup goals..."
                    className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1 font-bold text-[11px]">Target Timeline</label>
                    <select
                      value={formData.targetDeadline}
                      onChange={(e) => setFormData({ ...formData, targetDeadline: e.target.value })}
                      className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="1 Week (Express Delivery)">1 Week (Express Delivery)</option>
                      <option value="2-3 Weeks (Standard)">2-3 Weeks (Standard)</option>
                      <option value="1 Month">1 Month</option>
                      <option value="Flexible">Flexible Timeline</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-bold text-[11px]">Approximate Budget</label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="₹10,000 - ₹20,000">₹10,000 - ₹20,000 (Student Capstone)</option>
                      <option value="₹20,000 - ₹40,000">₹20,000 - ₹40,000 (Advanced AI / Full-Stack)</option>
                      <option value="₹40,000+">₹40,000+ (Full Enterprise SaaS)</option>
                    </select>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Direct email to <strong className="text-cyan-300">theprojectxia@gmail.com</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Project Idea</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomSoftwareRequestModal;
