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
  FileText,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import confetti from 'canvas-confetti';

// Strict Validator for Real Phone Number, Email, and Information
const validateClientInput = (name, phone, email, requirements) => {
  // 1. Name Check
  const trimmedName = String(name || '').trim();
  if (trimmedName.length < 2) {
    return 'Please enter your genuine full name.';
  }
  if (/^[^a-zA-Z]+$/.test(trimmedName) || /^(asdf|qwerty|test|xyz|abc|user|unknown)$/i.test(trimmedName)) {
    return 'Please enter a genuine name (not random letters).';
  }

  // 2. Phone / WhatsApp Number Check
  const rawPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (!rawPhone || rawPhone.length < 10 || rawPhone.length > 15) {
    return 'Please enter a valid 10-digit mobile or WhatsApp number.';
  }

  const isIndian10 = rawPhone.length === 10;
  const isIndian12 = rawPhone.length === 12 && rawPhone.startsWith('91');
  const standard10 = isIndian12 ? rawPhone.slice(2) : (isIndian10 ? rawPhone : null);

  if (standard10 && !/^[6-9]\d{9}$/.test(standard10)) {
    return 'Indian mobile numbers must start with 6, 7, 8, or 9 and have 10 digits.';
  }

  // Anti-Dummy / Anti-Repeated Number Checks
  const fakeSequences = [
    '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
    '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
    '1234567890', '0987654321', '9876543210', '0123456789', '1212121212',
    '9898989898', '9090909090', '7878787878', '9999900000', '1234512345'
  ];

  if (fakeSequences.some(seq => rawPhone.includes(seq))) {
    return 'Please provide your genuine, active phone number (test numbers like 1234567890 are blocked).';
  }

  const uniqueDigits = new Set(rawPhone.split('')).size;
  if (uniqueDigits < 4) {
    return 'Please enter a real phone number with active digits.';
  }

  // 3. Email Check
  const trimmedEmail = String(email || '').trim().toLowerCase();
  if (!trimmedEmail) {
    return 'Please enter your active email ID so our engineering team can send project blueprints.';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return 'Please enter a valid email address (e.g. name@gmail.com).';
  }

  const [localPart, domainPart] = trimmedEmail.split('@');
  if (!localPart || localPart.length < 3) {
    return 'Email username is too short. Please enter your real email.';
  }

  const fakeLocalNames = ['test', 'asdf', 'qwerty', 'fake', 'abc', '123', 'temp', 'dummy', 'spam'];
  if (fakeLocalNames.includes(localPart)) {
    return 'Please provide a genuine personal or university email ID.';
  }

  const disposableDomains = [
    'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
    'throwawaymail.com', 'yopmail.com', 'fakeinbox.com', 'trashmail.com',
    'temp-mail.org', 'sharklasers.com', 'getairmail.com', 'dispostable.com',
    'mytemp.email', 'tempinbox.com', 'burnermail.io', 'dropmail.me',
    'mohmal.com', 'crazymailing.com', 'fakemailgenerator.com'
  ];

  if (disposableDomains.includes(domainPart)) {
    return 'Disposable/temp emails are not allowed. Please use your real Gmail, Outlook, or official email.';
  }

  // 4. Requirements Quality Check
  const trimmedReq = String(requirements || '').trim();
  if (trimmedReq.length < 3) {
    return 'Please describe what you want to build (e.g. project features, tech).';
  }
  if (/^(asdf|qwerty|test|aaa|bbb|xxx|1234|abc)$/i.test(trimmedReq)) {
    return 'Please enter real software requirements.';
  }

  return null;
};

const CustomSoftwareRequestModal = ({ isOpen, onClose, onInquirySubmitted }) => {
  const { playClick, playSuccess } = useSound();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [clientError, setClientError] = useState('');

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
    setClientError('');

    // Strict Real Phone & Email Validation
    const validationErr = validateClientInput(
      formData.name,
      formData.mobile,
      formData.email,
      formData.requirements || formData.projectTitle
    );

    if (validationErr) {
      setClientError(validationErr);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        clientName: formData.name.trim(),
        clientEmail: formData.email.trim().toLowerCase(),
        clientMobile: formData.mobile.trim(),
        projectTitle: formData.projectTitle.trim() || formData.requirements.slice(0, 30),
        requirements: formData.requirements.trim(),
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
      setClientError(err.response?.data?.message || 'Failed to submit inquiry. Please check your contact details.');
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

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white">
                    Project Request Submitted!
                  </h3>
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-mono text-xs max-w-md mx-auto leading-relaxed shadow-lg shadow-emerald-950/50">
                    <p className="font-bold flex items-center justify-center gap-1.5 text-white">
                      <Clock className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                      <span>Guaranteed Response within 12 Hours</span>
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-200/90">
                      Our ProjectXia Engineering Team has received your specifications and will connect with you on WhatsApp / Phone directly.
                    </p>
                  </div>
                </div>

                <div className="max-w-sm mx-auto p-4 rounded-2xl bg-gray-900/90 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-500">Your Contact:</span>
                    <span className="text-cyan-300 font-bold">{formData.mobile || formData.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-500">Contact Window:</span>
                    <span className="text-emerald-400 font-bold">⚡ Within 12 Hours</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-500">Assigned Team:</span>
                    <span className="text-white">ProjectXia Engineering Team</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notification:</span>
                    <span className="text-cyan-400 font-bold">Delivered to Leadership</span>
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

                {/* Error Banner */}
                {clientError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-start gap-2 text-[11px] font-mono leading-relaxed shadow-lg shadow-red-950/40">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{clientError}</span>
                  </div>
                )}

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
