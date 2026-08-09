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

const CustomSoftwareRequestModal = ({ isOpen, onClose, initialTab = 'idea', onInquirySubmitted }) => {
  const { playClick, playSuccess, playShield } = useSound();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'idea' | 'callback'
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    department: 'Computer Science (CSE / IT)',
    projectTitle: '',
    requirements: '',
    techPreferences: ['React', 'Node.js', 'Python', 'AI/ML'],
    budgetRange: '₹15,000 - ₹30,000',
    targetDeadline: '2-3 Weeks',
    consultationMode: 'PHONE_CALL', // 'PHONE_CALL' | 'WHATSAPP' | 'GOOGLE_MEET'
    preferredTimeSlot: 'Morning (10:00 AM - 01:00 PM)',
    docLink: '',
  });

  const departmentOptions = [
    'Computer Science (CSE / IT)',
    'AI & Data Science (AI / ML)',
    'Cyber Security & WAF',
    'Electronics & Comm (ECE / IoT)',
    'Full-Stack Web & SaaS',
    'Mobile Application (iOS / Android)',
    'Blockchain, Smart Contracts & Web3',
    'Enterprise Cloud & Microservices',
  ];

  const techChoices = [
    'React',
    'Next.js',
    'Node.js / Express',
    'Python / Django',
    'FastAPI',
    'PyTorch / TensorFlow',
    'Flutter / React Native',
    'PostgreSQL / MongoDB',
    'TailwindCSS',
    'Docker / Kubernetes',
    'Solidity / Web3',
    'ESP32 / MicroPython',
  ];

  const handleTechToggle = (tech) => {
    playClick();
    setFormData((prev) => {
      const exists = prev.techPreferences.includes(tech);
      return {
        ...prev,
        techPreferences: exists
          ? prev.techPreferences.filter((t) => t !== tech)
          : [...prev.techPreferences, tech],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();

    if (activeTab === 'callback' && !formData.mobile) {
      alert('Please provide your mobile/WhatsApp number so our lead developer can reach you.');
      return;
    }

    if (activeTab === 'idea' && (!formData.projectTitle || !formData.requirements)) {
      alert('Please provide a project title and brief description of your software idea.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        clientName: formData.name || user?.name || 'Software Innovator',
        clientEmail: formData.email || user?.email || 'client@projectxia.io',
        clientMobile: formData.mobile || user?.mobile || '+91 99999 00000',
        department: formData.department,
        projectTitle: formData.projectTitle || (activeTab === 'callback' ? 'Custom Software Consultation & Architecture Enquiry' : 'Custom Software System'),
        requirements: formData.requirements || (activeTab === 'callback' ? 'Requested phone/WhatsApp consultation for custom software project by ProjectXia Developing Team.' : 'Custom Software Build Request'),
        techPreferences: formData.techPreferences,
        budgetRange: formData.budgetRange,
        targetDeadline: formData.targetDeadline,
        consultationMode: formData.consultationMode,
        preferredTimeSlot: formData.preferredTimeSlot,
        docLink: formData.docLink,
        type: activeTab === 'callback' ? 'CALLBACK_REQUEST' : 'IDEA_SUBMISSION',
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

        {/* Modal Window with Luxury Cyber Border */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl bg-gray-950/95 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/25 z-10 my-8 max-h-[92vh] flex flex-col backdrop-blur-3xl"
        >
          {/* Cyber Header */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border-b border-cyan-500/25">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-neon-cyan shrink-0">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-display font-black text-white">
                    Custom Software Development
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/50 font-bold uppercase tracking-wider">
                    In-House Team
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Direct Notification to <strong className="text-cyan-300 font-bold">theprojectxia@gmail.com</strong> • Full IP Handover</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playClick();
                handleResetAndClose();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 font-sans">
            {submittedResult ? (
              /* Success Confirmation View */
              <div className="py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-white">
                    {activeTab === 'callback' ? 'Callback Request Dispatched!' : 'Software Project Idea Received!'}
                  </h3>
                  <p className="text-xs font-mono text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {activeTab === 'callback'
                      ? `Your callback request has been sent directly to the ProjectXia developing team leadership (theprojectxia@gmail.com). Our Senior Architect will reach out via ${formData.consultationMode} at ${formData.preferredTimeSlot}.`
                      : 'Your software architecture specs have been delivered to the ProjectXia Core Engineering Team (theprojectxia@gmail.com). We will analyze your requirements and reach out with a detailed timeline & milestone breakdown.'}
                  </p>
                </div>

                {/* Reference Card */}
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-gray-900/90 border border-slate-800 text-left font-mono text-xs space-y-2.5 text-slate-300 shadow-xl">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Tracking Reference:</span>
                    <span className="text-cyan-400 font-bold">{submittedResult._id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Direct Recipient:</span>
                    <span className="text-cyan-300 font-bold">theprojectxia@gmail.com</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Assigned Team:</span>
                    <span className="text-emerald-400">ProjectXia Core Developing Team</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-500">Target Deadline:</span>
                    <span className="text-white">{submittedResult.targetDeadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-yellow-400 font-bold">
                      {submittedResult.status === 'CALLBACK_SCHEDULED' ? '📞 Callback Scheduled' : '🔍 Under Lead Review'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                  >
                    View in My Profile & Projects →
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mode Selector Tabs (Clean Aligned Grid) */}
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-gray-900/90 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setActiveTab('idea');
                    }}
                    className={`py-3 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                      activeTab === 'idea'
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span>Share Software Idea</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setActiveTab('callback');
                    }}
                    className={`py-3 px-3 rounded-xl font-display font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                      activeTab === 'callback'
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg shadow-purple-500/25'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Request Call Back / Enquiry</span>
                  </button>
                </div>

                {/* Direct Dispatch & In-House Guarantee Banner */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900/60 to-purple-950/50 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Inquiries sent directly to <strong className="text-cyan-200">theprojectxia@gmail.com</strong> (Official Developing Team)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] whitespace-nowrap">
                    100% In-House Code & NDA
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                  {/* Basic Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-bold">Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-bold">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email address"
                        className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1 text-[11px] font-bold">WhatsApp / Mobile *</label>
                      <input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="Enter phone or WhatsApp number"
                        required
                        className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* TAB 1: SHARE IDEA SPECIFICS */}
                  {activeTab === 'idea' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Department / Domain</label>
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none cursor-pointer"
                          >
                            {departmentOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Software Title / Concept *</label>
                          <input
                            type="text"
                            value={formData.projectTitle}
                            onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                            placeholder="Enter project title or software concept"
                            required
                            className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Tech Stack Preferences */}
                      <div>
                        <label className="text-slate-300 block mb-1.5 text-[11px] font-bold">
                          Preferred Tech Stack (Select all that apply)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {techChoices.map((tech) => {
                            const isSelected = formData.techPreferences.includes(tech);
                            return (
                              <button
                                type="button"
                                key={tech}
                                onClick={() => handleTechToggle(tech)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                                    : 'bg-gray-900 border border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {tech}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Description / Requirements */}
                      <div>
                        <label className="text-slate-300 block mb-1 text-[11px] font-bold">
                          Project Requirements & Core Feature Scope *
                        </label>
                        <textarea
                          rows={4}
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                          placeholder="Describe your software requirement, key features, target users, and any specific preferences..."
                          required
                          className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>

                      {/* Budget & Timeline */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Budget Range</label>
                          <select
                            value={formData.budgetRange}
                            onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                            className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                          >
                            <option value="₹10,000 - ₹20,000">₹10,000 - ₹20,000 (Standard Capstone)</option>
                            <option value="₹20,000 - ₹40,000">₹20,000 - ₹40,000 (Advanced AI / SaaS)</option>
                            <option value="₹40,000 - ₹75,000">₹40,000 - ₹75,000 (Full Enterprise Build)</option>
                            <option value="₹75,000+">₹75,000+ (Commercial Scale)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Target Timeline</label>
                          <select
                            value={formData.targetDeadline}
                            onChange={(e) => setFormData({ ...formData, targetDeadline: e.target.value })}
                            className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
                          >
                            <option value="1 Week (Urgent / Express)">1 Week (Express Delivery)</option>
                            <option value="2-3 Weeks (Standard)">2-3 Weeks (Standard)</option>
                            <option value="1 Month">1 Month</option>
                            <option value="2+ Months (Milestone-based)">2+ Months</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Document Link (Optional)</label>
                          <input
                            type="url"
                            value={formData.docLink}
                            onChange={(e) => setFormData({ ...formData, docLink: e.target.value })}
                            placeholder="Paste link to synopsis or PDF (Optional)"
                            className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* TAB 2: INSTANT CALL BACK SPECIFICS */
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                        <h4 className="font-display font-bold text-white text-sm flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Direct Architecture Consultation with ProjectXia Lead Developer</span>
                        </h4>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Speak directly with our in-house engineering leads. We will analyze your project scope, recommend optimal tech stacks, outline milestones, and provide a fixed quotation within 1 hour.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Preferred Consultation Channel</label>
                          <select
                            value={formData.consultationMode}
                            onChange={(e) => setFormData({ ...formData, consultationMode: e.target.value })}
                            className="w-full bg-gray-900 border border-slate-800 focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none cursor-pointer"
                          >
                            <option value="PHONE_CALL">Direct Phone Call</option>
                            <option value="WHATSAPP">WhatsApp Voice / Chat</option>
                            <option value="GOOGLE_MEET">Google Meet Screen Share</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-300 block mb-1 text-[11px] font-bold">Preferred Callback Time</label>
                          <select
                            value={formData.preferredTimeSlot}
                            onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                            className="w-full bg-gray-900 border border-slate-800 focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-white focus:outline-none cursor-pointer"
                          >
                            <option value="Immediate (Next 30 Minutes)">Immediate (Next 30 Minutes)</option>
                            <option value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                            <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                            <option value="Evening (06:00 PM - 09:00 PM)">Evening (06:00 PM - 09:00 PM)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 text-[11px] font-bold">
                          Brief Note / What do you want to discuss?
                        </label>
                        <textarea
                          rows={3}
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                          placeholder="Describe your software requirement or the topic you want to build..."
                          className="w-full bg-gray-900 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submission Button */}
                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Sent directly to <strong className="text-cyan-300">theprojectxia@gmail.com</strong></span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full sm:w-auto px-6 py-3 rounded-xl font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                        activeTab === 'callback'
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-purple-500/25 hover:opacity-95'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/25'
                      }`}
                    >
                      {submitting ? (
                        <span>Dispatching to theprojectxia@gmail.com...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>
                            {activeTab === 'callback' ? 'Schedule Call Back Now' : 'Submit Idea to ProjectXia Team'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomSoftwareRequestModal;
