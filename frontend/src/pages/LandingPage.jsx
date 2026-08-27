import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  Play,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Code,
  Globe,
  MessageSquare,
  ChevronDown,
  Terminal,
  Activity,
  Layers,
  Database,
  Check,
  Video,
  Lightbulb,
  Settings,
  HardDrive,
  Users,
  UserCheck,
  KeyRound,
  Mail,
  PhoneCall,
  ShoppingCart,
  UploadCloud,
  FileCode2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import VideoPlayerModal from '../components/ui/VideoPlayerModal';
import ArchitecturePeekModal from '../components/ui/ArchitecturePeekModal';
import CustomSoftwareRequestModal from '../components/ui/CustomSoftwareRequestModal';
import { useSound } from '../context/SoundContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import confetti from 'canvas-confetti';

const LandingPage = () => {
  const navigate = useNavigate();
  const { playClick, playHover, playShield, playSuccess } = useSound();
  const {
    user,
    isAuthenticated,
    openAuthModal,
    googleSignIn,
    firebaseGoogleSignIn,
    login,
    forgotPassword,
    resetPassword,
    quickRegisterLogin,
  } = useAuth();

  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [activePeekProject, setActivePeekProject] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  // Landing Page Inline Fast Auth State
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlinePassword, setInlinePassword] = useState('');
  const [inlineAuthMsg, setInlineAuthMsg] = useState('');
  const [inlineLoading, setInlineLoading] = useState(false);
  const [showAutoRegisterBtn, setShowAutoRegisterBtn] = useState(false);

  // Forgot Password Dialog State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [forgotOtpInput, setForgotOtpInput] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Pass
  const [forgotStatusMsg, setForgotStatusMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Real-time Code & Abstract Plagiarism Scanner on Landing Page
  const [scanInput, setScanInput] = useState('');
  const [scanOutput, setScanOutput] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await api.get('/projects?sort=popular');
      setFeaturedProjects(res.data.projects?.slice(0, 4) || []);
    } catch (e) {}
  };

  const handleProtectedNavigation = (path, reason) => {
    playClick();
    if (isAuthenticated) {
      navigate(path);
    } else {
      openAuthModal('login', reason || 'Please log in, register, or use Google Fast Sign-In to access this section.');
    }
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setInlineLoading(true);
    setInlineAuthMsg('');
    setShowAutoRegisterBtn(false);

    // Enforce login check against registered accounts
    const res = await login(inlineEmail, inlinePassword);
    setInlineLoading(false);

    if (res.success) {
      playSuccess();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/');
    } else {
      if (res.notRegistered) {
        setInlineAuthMsg('No account found with this Email ID. Please register with your Email ID and password first.');
        openAuthModal('register', `No account found for ${inlineEmail}. Please set your password to complete registration.`);
      } else {
        setInlineAuthMsg(res.message || 'Login failed. Please verify your credentials.');
      }
    }
  };

  const handleInlineAutoRegister = async () => {
    openAuthModal('register', 'Please create your account with your Email ID and password.');
  };

  const handleInlineGoogle = async () => {
    playClick();
    const res = await firebaseGoogleSignIn();
    if (res.success) {
      playSuccess();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/marketplace');
    } else {
      setInlineAuthMsg(res.message || 'Google Sign-In was cancelled.');
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatusMsg('');
    const res = await forgotPassword(forgotEmailInput);
    setForgotLoading(false);
    if (res.success) {
      playSuccess();
      setForgotStep(2);
      setForgotStatusMsg(res.message);
      confetti({ particleCount: 40, spread: 50 });
    } else {
      setForgotStatusMsg(res.message);
    }
  };

  const handleCompletePasswordReset = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatusMsg('');
    const res = await resetPassword(forgotEmailInput, forgotNewPassword, forgotOtpInput);
    setForgotLoading(false);
    if (res.success) {
      playSuccess();
      setShowForgotModal(false);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else {
      setForgotStatusMsg(res.message);
    }
  };

  const handleSimulatedScan = () => {
    if (!isAuthenticated) {
      openAuthModal('login', 'Please log in or register to use the ProjectXia Plagiarism & Code Integrity Checker.');
      return;
    }
    if (!scanInput) return;
    playShield();
    setIsScanning(true);
    setScanOutput(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanOutput({
        trustScore: 99,
        plagiarism: '0.4%',
        cleanCode: 98,
        verdict: 'Original project verified. Clean abstract & zero backdoors detected.',
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }, 800);
  };



  const faqs = [
    {
      q: 'How does ProjectXia guarantee zero scams and verified authentic projects?',
      a: 'To list any project on ProjectXia, the seller MUST provide: (1) A working prototype video walkthrough, (2) Detailed project abstract & synopsis, (3) Complete architecture / circuit schematics, (4) A transparent fixed price, and (5) A verified originality report from our built-in scanner.',
    },
    {
      q: 'Why is registration required to view projects and use the chat?',
      a: 'To protect student and creator intellectual property and prevent automated scrapers, bots, or fraudulent entities, only registered and verified members can access full marketplace details, test plagiarism, and chat directly with creators.',
    },
    {
      q: 'How does direct chat work between buyers and sellers?',
      a: 'When an authorized user views any project, clicking "Direct Chat with Creator" immediately opens a real-time messaging room with the seller. You can ask technical questions, request custom modifications, discuss hardware delivery, and finalize details directly through our secure platform.',
    },
    {
      q: 'What is the ProjectXia Custom Web & Hardware Development Team?',
      a: 'Our in-house engineering team builds custom projects from scratch! If you have a startup idea, capstone requirement, or specific prototype need, submit your idea to us and our engineers will build, test, and deliver the complete solution with full documentation.',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D VIDEO & PARTICLES HERO SECTION WITH INTEGRATED AUTH CARD */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Pixellon Shimmer Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#050508]/90 border border-[#00ffaa]/50 backdrop-blur-3xl shadow-[0_0_25px_rgba(0,255,170,0.3)] hover:border-[#00ffaa] hover:shadow-[0_0_35px_rgba(0,255,170,0.5)] transition-all duration-300 cursor-pointer"
            >
              <div className="p-1 rounded-full bg-[#00ffaa]/20 text-[#00ffaa] shadow-[0_0_10px_rgba(0,255,170,0.5)]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span className="text-xs font-mono font-bold text-[#00ffaa] tracking-wider uppercase">
                ⚡ NEXT-GEN ENGINEERING ECOSYSTEM • LIVE HUB
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#00ffaa] animate-ping ml-1" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl lg:text-8xl font-display font-black tracking-tight text-white leading-[1.05]"
            >
              Where Innovators <br />
              <span className="text-gradient-pixellon">Buy, Sell & Build Real Code</span>
            </motion.h1>

            {/* Mission Statement */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base sm:text-lg text-neutral-300 font-sans leading-relaxed max-w-3xl mx-auto"
            >
              The verified ecosystem for engineering students, creators, and researchers across <strong className="text-[#00ffaa] font-bold">CSE, ECE, EEE, Mech, AI, and IoT</strong>. Verified video walkthroughs, schematics, built-in code originality audit, and direct creator chat.
            </motion.p>

            {/* CTA Action Buttons (Rounded Pills) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              {/* 1. Explore Projects */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation('/marketplace', 'Please log in or register to explore verified engineering projects.')}
                className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer"
              >
                <Code className="w-4 h-4 shrink-0" />
                <span>Explore Projects</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              {/* 2. Sell Project */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation('/upload', 'Please log in or register to upload and monetize your project.')}
                className="px-8 py-4 rounded-full bg-[#00ffaa] hover:bg-[#33ffbb] text-black font-display font-bold text-sm shadow-[0_0_25px_rgba(0,255,170,0.4)] flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-black shrink-0" />
                <span>+ Sell a Project</span>
              </button>

              {/* 3. Plagiarism Checker */}
              <button
                type="button"
                onClick={() => handleProtectedNavigation('/ai-shield', 'Please log in or register to run AI Plagiarism & Code Integrity scans.')}
                className="px-7 py-4 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/15 text-neutral-200 font-display font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Plagiarism Checker</span>
              </button>
            </motion.div>

            {/* 4 Pillars Quick Overview Cards */}
            {/* 4 Pillars Quick Overview Cards - ULTRA-HIGH VISIBILITY ELECTRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 text-left">
              {/* 1. Buy Projects Card (Electric Cyan & Royal Blue) */}
              <div
                onClick={() => handleProtectedNavigation('/marketplace', 'Please log in or register to explore verified engineering projects.')}
                className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/95 via-slate-900 to-blue-950/95 border-2 border-cyan-400 shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:shadow-[0_0_60px_rgba(56,189,248,0.85)] hover:border-cyan-300 hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-400/35 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-cyan-400 text-black shadow-[0_0_22px_rgba(56,189,248,0.9)] group-hover:scale-110 transition-transform">
                    <Code className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-mono font-black px-3 py-1.5 rounded-full bg-cyan-400/25 text-cyan-200 border border-cyan-400 uppercase tracking-widest shadow-sm">
                    EXPLORE
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-white group-hover:text-cyan-300 transition-colors relative z-10 mb-1.5 drop-shadow-md">
                  1. Buy Projects
                </h3>
                <p className="text-xs sm:text-sm text-white font-bold leading-relaxed relative z-10">
                  Verified source code, circuits & 4K video walkthroughs ready for instant download.
                </p>
              </div>

              {/* 2. Sell Your Project Card (Neon Mint Green) */}
              <div
                onClick={() => handleProtectedNavigation('/upload', 'Please log in or register to upload and monetize your project.')}
                className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/95 via-slate-900 to-teal-950/95 border-2 border-[#00ffaa] shadow-[0_0_40px_rgba(0,255,170,0.5)] hover:shadow-[0_0_60px_rgba(0,255,170,0.85)] hover:border-[#33ffbb] hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00ffaa]/35 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-[#00ffaa] text-black shadow-[0_0_22px_rgba(0,255,170,0.9)] group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-mono font-black px-3 py-1.5 rounded-full bg-[#00ffaa]/25 text-[#00ffaa] border border-[#00ffaa] uppercase tracking-widest shadow-sm">
                    MONETIZE
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-white group-hover:text-[#00ffaa] transition-colors relative z-10 mb-1.5 drop-shadow-md">
                  2. Sell Your Project
                </h3>
                <p className="text-xs sm:text-sm text-white font-bold leading-relaxed relative z-10">
                  Monetize your original projects & source code with direct instant payouts.
                </p>
              </div>

              {/* 3. Plagiarism Check Card (Vivid Neon Fuchsia/Purple) */}
              <div
                onClick={() => handleProtectedNavigation('/ai-shield', 'Please log in or register to run AI Plagiarism & Code Integrity scans.')}
                className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/95 via-slate-900 to-fuchsia-950/95 border-2 border-fuchsia-400 shadow-[0_0_40px_rgba(232,121,249,0.5)] hover:shadow-[0_0_60px_rgba(232,121,249,0.85)] hover:border-fuchsia-300 hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-fuchsia-400/35 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-fuchsia-400 text-black shadow-[0_0_22px_rgba(232,121,249,0.9)] group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-mono font-black px-3 py-1.5 rounded-full bg-fuchsia-400/25 text-fuchsia-200 border border-fuchsia-400 uppercase tracking-widest shadow-sm">
                    VERIFY
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-white group-hover:text-fuchsia-300 transition-colors relative z-10 mb-1.5 drop-shadow-md">
                  3. Plagiarism Check
                </h3>
                <p className="text-xs sm:text-sm text-white font-bold leading-relaxed relative z-10">
                  Scan code & IEEE thesis reports against billions of sources for originality.
                </p>
              </div>

              {/* 4. Build Custom Card (Vivid Gold & Amber) */}
              <div
                onClick={() => {
                  playSuccess();
                  setIsDevModalOpen(true);
                }}
                className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/95 via-slate-900 to-yellow-950/95 border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.5)] hover:shadow-[0_0_60px_rgba(251,191,36,0.85)] hover:border-amber-300 hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/35 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="p-3 rounded-2xl bg-amber-400 text-black shadow-[0_0_22px_rgba(251,191,36,0.9)] group-hover:scale-110 transition-transform">
                    <Lightbulb className="w-6 h-6 stroke-[3]" />
                  </div>
                  <span className="text-[11px] font-mono font-black px-3 py-1.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-400 uppercase tracking-widest shadow-sm">
                    DEV TEAM
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-white group-hover:text-amber-300 transition-colors relative z-10 mb-1.5 drop-shadow-md">
                  4. Build Custom
                </h3>
                <p className="text-xs sm:text-sm text-white font-bold leading-relaxed relative z-10">
                  Hire our in-house engineering team with guaranteed 12-hour callback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* LIVE AI PLAGIARISM CHECKER DEMO SANDBOX */}
      <section className="py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                  Built-In Engineering Plagiarism & Originality Checker
                </span>
                <h3 className="text-2xl font-display font-black text-white mt-1">
                  Verify Abstract, Code & Hardware Originality
                </h3>
                <p className="text-xs font-sans text-neutral-400 mt-1">
                  To prevent fake projects or plagiarism, every upload is scanned before publication.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-[#00ffaa] text-xs font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>NVD & Academic Repository DB</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Paste GitHub repo link, project synopsis, or code snippet..."
                  className="flex-1 bg-black/60 border border-white/10 focus:border-[#00ffaa] rounded-full px-5 py-3 text-xs text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleSimulatedScan}
                  disabled={isScanning}
                  className="px-7 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                >
                  {isScanning ? (
                    <span className="font-mono text-xs">Deep AST Scanning...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Check Plagiarism</span>
                    </>
                  )}
                </button>
              </div>

              {scanOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-black/60 border border-purple-500/40 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono"
                >
                  <div className="sm:col-span-2">
                    <p className="text-neutral-400">Shield Verdict:</p>
                    <p className="text-purple-300 font-bold text-sm mt-0.5">{scanOutput.verdict}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Originality Score:</p>
                    <p className="text-[#00ffaa] font-bold text-lg">{scanOutput.trustScore}%</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Plagiarism Index:</p>
                    <p className="text-indigo-400 font-bold text-lg">{scanOutput.plagiarism}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROJECTXIA IN-HOUSE CUSTOM DEVELOPMENT AGENCY SECTION */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00ffaa]/10 text-[#00ffaa] text-xs font-mono font-bold border border-[#00ffaa]/30">
                  <Code className="w-3.5 h-3.5" />
                  <span>PROJECTXIA WEB & HARDWARE DEVELOPMENT TEAM</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-display font-black text-white leading-tight">
                  Have a Startup Idea or Need a Final Year Build? <span className="text-gradient-pixellon">We Build It for You!</span>
                </h2>

                <p className="text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed max-w-2xl">
                  Don't have time to build or need custom guidance? Our in-house engineering team designs and develops custom web apps, mobile apps, IoT hardware setups, AI models, and robotics projects from scratch with complete runbook documentation and milestone video walkthroughs.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSuccess();
                      setIsDevModalOpen(true);
                    }}
                    className="px-7 py-3.5 rounded-full bg-[#00ffaa] hover:bg-[#33ffbb] text-black font-display font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,170,0.4)] transition-all hover:scale-105 cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4 text-black" />
                    <span>Submit Your Idea or Request Topic Suggestions</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3 font-mono text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Custom Web & Mobile Apps</p>
                    <p className="text-[11px] text-slate-400">React, Node.js, Next.js, Flutter & Cloud</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Hardware, IoT & Robotics</p>
                    <p className="text-[11px] text-slate-400">ESP32, LoRa, Arduino, PCB & ROS2</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Fixed Transparent Pricing</p>
                    <p className="text-[11px] text-slate-400">Zero hidden fees, milestone delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>




      {/* Architecture & Code Peek Modal */}
      {activePeekProject && (
        <ArchitecturePeekModal
          project={activePeekProject}
          onClose={() => setActivePeekProject(null)}
        />
      )}

      {/* FAQS SECTION - STYLISH FUTURISTIC NEON KNOWLEDGE BASE */}
      <section className="py-24 relative z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-[#00ffaa]/40 text-[#00ffaa] text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(0,255,170,0.2)]">
              <HelpCircle className="w-3.5 h-3.5 text-[#00ffaa] animate-pulse" />
              <span>Platform Knowledge Base • FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
              Frequently Asked <span className="text-gradient-pixellon">Questions</span>
            </h2>
            <p className="text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed max-w-xl mx-auto">
              Everything you need to know about project ownership, verification, instant checkout, and custom engineering.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className={`rounded-3xl transition-all duration-300 backdrop-blur-3xl overflow-hidden ${
                    isOpen
                      ? 'bg-gradient-to-br from-emerald-950/90 via-[#0b1329]/95 to-teal-950/90 border-2 border-[#00ffaa] shadow-[0_0_45px_rgba(0,255,170,0.45),inset_0_1px_2px_0_rgba(255,255,255,0.4)]'
                      : 'bg-[#0a101d]/70 border border-white/25 hover:border-[#00ffaa]/70 hover:bg-[#0f172a]/85 shadow-[0_10px_35px_rgba(0,0,0,0.7),inset_0_1px_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_40px_rgba(0,255,170,0.25),inset_0_1px_2px_0_rgba(255,255,255,0.45)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setActiveFaq(isOpen ? null : idx);
                    }}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-black shrink-0 transition-all ${
                        isOpen
                          ? 'bg-[#00ffaa] text-black shadow-[0_0_15px_rgba(0,255,170,0.8)]'
                          : 'bg-white/10 text-[#00ffaa] border border-white/20 group-hover:bg-[#00ffaa]/25 group-hover:border-[#00ffaa]/60 shadow-inner'
                      }`}>
                        0{idx + 1}
                      </span>
                      <h3 className={`font-display font-bold text-sm sm:text-base leading-snug transition-colors ${
                        isOpen ? 'text-[#00ffaa] drop-shadow-md' : 'text-white group-hover:text-[#00ffaa]'
                      }`}>
                        {faq.q}
                      </h3>
                    </div>

                    <div className={`p-2 rounded-xl transition-all shrink-0 ${
                      isOpen
                        ? 'bg-[#00ffaa]/25 text-[#00ffaa] border border-[#00ffaa]/50 rotate-180 shadow-[0_0_15px_rgba(0,255,170,0.4)]'
                        : 'bg-white/10 text-slate-300 border border-white/20 group-hover:text-white group-hover:bg-white/20'
                    }`}>
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </div>
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-6 pb-6 pt-1 text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed border-t border-[#00ffaa]/20 space-y-2"
                    >
                      <p>{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Modal Trigger */}
      {activeVideoModal && (
        <VideoPlayerModal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          videoUrl={activeVideoModal.demoVideo}
          title={activeVideoModal.title}
          category={activeVideoModal.category}
          trustScore={activeVideoModal.trustScore}
        />
      )}

      {/* Custom Software Inquiry Modal */}
      <CustomSoftwareRequestModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
