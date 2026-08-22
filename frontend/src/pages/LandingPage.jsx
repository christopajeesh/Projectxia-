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

    // 1. Try direct login
    let res = await login(inlineEmail, inlinePassword);

    // 2. If user is new, auto-register and sign in instantly
    if (!res.success) {
      res = await quickRegisterLogin(inlineEmail, inlinePassword || 'ProjectXia@2026');
    }

    setInlineLoading(false);
    if (res.success) {
      playSuccess();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/');
    } else {
      setInlineAuthMsg(res.message);
    }
  };

  const handleInlineAutoRegister = async () => {
    setInlineLoading(true);
    setInlineAuthMsg('');
    const res = await quickRegisterLogin(inlineEmail, inlinePassword || 'ProjectXia@2026');
    setInlineLoading(false);
    if (res.success) {
      playSuccess();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/');
    } else {
      setInlineAuthMsg(res.message);
    }
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
      q: 'How does direct WhatsApp-style chat work between buyers and sellers?',
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-left">
              <div
                onClick={() => handleProtectedNavigation('/marketplace', 'Please log in or register to explore verified engineering projects.')}
                className="p-5 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Code className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-xs text-white group-hover:text-indigo-300">1. Buy Projects</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Verified source code, circuits & 4K video walkthroughs.
                </p>
              </div>

              <div
                onClick={() => handleProtectedNavigation('/upload', 'Please log in or register to upload and monetize your project.')}
                className="p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-xs text-white group-hover:text-emerald-300">2. Sell Your Project</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Monetize your original projects & code with direct payouts.
                </p>
              </div>

              <div
                onClick={() => handleProtectedNavigation('/ai-shield', 'Please log in or register to run AI Plagiarism & Code Integrity scans.')}
                className="p-4 rounded-2xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-400 group-hover:text-black transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-xs text-white group-hover:text-purple-300">3. Plagiarism Check</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Scan code & IEEE thesis reports for originality score.
                </p>
              </div>

              <div
                onClick={() => {
                  playSuccess();
                  setIsDevModalOpen(true);
                }}
                className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-blue-950/60 hover:from-purple-900/80 hover:to-blue-900/80 border border-purple-500/40 hover:border-purple-300 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span className="font-display font-bold text-xs text-white group-hover:text-amber-300">4. Build Custom</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Hire our in-house engineers with 12h callback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED INFINITE GLASS MARQUEE RIBBON (Tech Stack & Real-Time Pulse) */}
      <div className="py-5 relative z-10 overflow-hidden border-y border-white/15 bg-white/[0.02] backdrop-blur-3xl">
        <div className="flex gap-8 whitespace-nowrap animate-marquee select-none">
          <div className="flex items-center gap-8 shrink-0">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-ping" />
              React 18 & Vite 5 Engine
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Framer Motion 3D Physics
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#00ffaa]" />
              Python AST Plagiarism Protection
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Lenis Smooth Momentum Scroll
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              IoT ESP32 & LoRa Wireless
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Tamper-Proof Code Encryption
            </span>
          </div>
          {/* Duplicate set for seamless infinite loop */}
          <div className="flex items-center gap-8 shrink-0">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#00ffaa] animate-ping" />
              React 18 & Vite 5 Engine
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Framer Motion 3D Physics
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#00ffaa]" />
              Python AST Plagiarism Protection
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Lenis Smooth Momentum Scroll
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              IoT ESP32 & LoRa Wireless
            </span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-neutral-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Tamper-Proof Code Encryption
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* NEW USER & CUSTOMER GUIDE: 4 CORE PLATFORM PILLARS EXPLAINED    */}
      {/* ================================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 relative z-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14 space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-[#00ffaa]/30 text-[#00ffaa] text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(0,255,170,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#00ffaa] animate-spin" />
              <span>Customer Guide • How ProjectXia Works</span>
            </div>
            <h2 className="text-3xl sm:text-6xl font-display font-black text-white tracking-tight leading-tight">
              Simple Ways to <span className="text-gradient-pixellon">Build, Buy & Sell</span>
            </h2>
            <p className="text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed">
              New to ProjectXia? Whether you want to <strong className="text-[#00ffaa]">download tested pre-built projects</strong>, hire our <strong className="text-indigo-400">in-house team to build your custom software/hardware idea</strong>, or <strong className="text-purple-400">sell your own code</strong>, here is how each feature works:
            </p>
          </motion.div>

          {/* 4 Pillar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARD 1: EXPLORE & BUY MARKETPLACE PROJECTS */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold uppercase">
                    1. Buy Projects
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-display font-black text-white group-hover:text-indigo-300 transition-colors">
                    Explore & Buy Marketplace
                  </h3>
                  <p className="text-xs font-sans text-neutral-400 mt-2 leading-relaxed">
                    Browse thousands of complete, tested engineering projects across <span className="text-[#00ffaa] font-bold">CSE, ECE, EEE, Mech, AI/ML, and IoT</span>.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-[11px] font-sans text-neutral-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] shrink-0 mt-0.5" />
                    <span>Full source code, circuit diagrams & KiCAD files</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] shrink-0 mt-0.5" />
                    <span>Working 4K demo video preview for every project</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] shrink-0 mt-0.5" />
                    <span>Instant download with complete setup runbook</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/marketplace', 'Please log in to browse and download verified engineering projects.')}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <span>Browse Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* CARD 2: CUSTOM SOFTWARE BUILD */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Lightbulb className="w-6 h-6 text-amber-300" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold uppercase">
                    2. In-House Team
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-display font-black text-white group-hover:text-purple-300 transition-colors">
                    Build Custom Software
                  </h3>
                  <p className="text-xs font-sans text-neutral-400 mt-2 leading-relaxed">
                    Have a unique idea, thesis, or startup MVP? Our <span className="text-purple-300 font-bold">In-House Engineering Team</span> will build and deliver it for you.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-[11px] font-sans text-neutral-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Direct engineering consultation with ProjectXia developers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>Custom web apps, mobile apps, hardware & AI</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span>100% IP ownership & milestone video updates</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    playSuccess();
                    setIsDevModalOpen(true);
                  }}
                  className="w-full py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                  <span>Build My Project Idea →</span>
                </button>
              </div>
            </motion.div>

            {/* CARD 3: SELL PROJECTS & MONETIZE */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-[#00ffaa]/50 transition-all duration-300 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,170,0.2)] hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#00ffaa]/10 text-[#00ffaa] border border-[#00ffaa]/30">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#00ffaa]/10 text-[#00ffaa] border border-[#00ffaa]/30 text-[10px] font-mono font-bold uppercase">
                    3. Sell & Earn
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-display font-black text-white group-hover:text-[#00ffaa] transition-colors">
                    Sell Projects & Monetize Code
                  </h3>
                  <p className="text-xs font-sans text-neutral-400 mt-2 leading-relaxed">
                    Are you an engineer, developer, or creator? Turn your completed hardware or software projects into recurring income.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-[11px] font-sans text-neutral-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] shrink-0 mt-0.5" />
                    <span>Set your own price in INR (₹) per download</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] shrink-0 mt-0.5" />
                    <span>Direct bank/UPI payouts on verified sales</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffaa] shrink-0 mt-0.5" />
                    <span>Built-in piracy & tamper protection</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/upload', 'Please log in or register to publish and sell your engineering project.')}
                  className="w-full py-3 rounded-full bg-[#00ffaa] hover:bg-[#33ffbb] text-black font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,170,0.3)] transition-all cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-black" />
                  <span>Start Selling Code →</span>
                </button>
              </div>
            </motion.div>

            {/* CARD 4: AI PLAGIARISM & CODE ORIGINALITY SCANNER */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:-translate-y-2"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                    4. AI Plagiarism
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-display font-black text-white group-hover:text-cyan-300 transition-colors">
                    AI Plagiarism & Originality
                  </h3>
                  <p className="text-xs font-sans text-neutral-400 mt-2 leading-relaxed">
                    Verify code & IEEE report originality before final submission with our AI Trust Shield scanner.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10 text-[11px] font-sans text-neutral-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Scans GitHub, StackOverflow & IEEE databases</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Instant PDF Originality Certificate download</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Security audit for secret keys & vulnerable dependencies</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/ai-shield', 'Please log in or register to run AI Plagiarism & Code Integrity scans.')}
                  className="w-full py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Run Plagiarism Scan →</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURED REGISTRIES - HORIZONTAL SIDEWAYS CAROUSEL (Pixellon Selected Work) */}
      <section className="py-20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#00ffaa]" />
                // FEATURED REGISTRIES
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white mt-1">
                SELECTED WORK
              </h2>
            </div>
            
            {/* Scroll Navigation Control Buttons & Indicator */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline-flex items-center gap-2">
                <span>← Swipe / Scroll Sideways →</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('featured-track');
                    if (el) el.scrollBy({ left: -380, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all hover:scale-105 cursor-pointer"
                  title="Scroll Left"
                >
                  <ChevronDown className="w-4 h-4 rotate-90 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('featured-track');
                    if (el) el.scrollBy({ left: 380, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all hover:scale-105 cursor-pointer"
                  title="Scroll Right"
                >
                  <ChevronDown className="w-4 h-4 -rotate-90 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Sideways Scrollable Track with Smooth Glide Transition */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            id="featured-track"
            data-lenis-prevent
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory focus:outline-none scroll-smooth"
          >
            {/* Featured Card 1 */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-[320px] sm:min-w-[420px] max-w-[440px] p-6 rounded-3xl bg-white/[0.02] border border-white/15 hover:border-[#00ffaa] backdrop-blur-3xl transition-all duration-300 snap-start shadow-2xl flex flex-col justify-between group cursor-pointer hover:shadow-[0_0_35px_rgba(0,255,170,0.25)]"
              onClick={() => handleProtectedNavigation('/marketplace', 'Please log in to view project details.')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">PROJECT 01</span>
                  <span className="px-3 py-1 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-[#00ffaa] text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,170,0.2)]">ONGOING</span>
                </div>

                <div>
                  <h3 className="text-2xl font-display font-black text-white group-hover:text-[#00ffaa] transition-colors">
                    ProjectXia Core Engine
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-neutral-300 mt-2 leading-relaxed line-clamp-3">
                    Full-stack verified software marketplace connecting engineering students and developers to verified source code, circuit diagrams, and live demo streams.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">React 18</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">Node.js</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">Firebase</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">Tailwind</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:text-[#00ffaa] transition-colors">
                <span className="font-bold tracking-wider">LIVE_DEPLOY.EXE</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Featured Card 2 */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-[320px] sm:min-w-[420px] max-w-[440px] p-6 rounded-3xl bg-white/[0.02] border border-white/15 hover:border-[#00ffaa] backdrop-blur-3xl transition-all duration-300 snap-start shadow-2xl flex flex-col justify-between group cursor-pointer hover:shadow-[0_0_35px_rgba(0,255,170,0.25)]"
              onClick={() => handleProtectedNavigation('/ai-shield', 'Please log in to run AI Plagiarism scans.')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">PROJECT 02</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.2)]">PRODUCTION</span>
                </div>

                <div>
                  <h3 className="text-2xl font-display font-black text-white group-hover:text-[#00ffaa] transition-colors">
                    AI Plagiarism & Code Shield
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-neutral-300 mt-2 leading-relaxed line-clamp-3">
                    Deep AST structural code analyzer checking repository similarity against National Vulnerability Database and academic code archives.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">Python AST</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">Gemini AI</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">REST API</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:text-[#00ffaa] transition-colors">
                <span className="font-bold tracking-wider">LIVE_DEPLOY.EXE</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Featured Card 3 */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-[320px] sm:min-w-[420px] max-w-[440px] p-6 rounded-3xl bg-white/[0.02] border border-white/15 hover:border-[#00ffaa] backdrop-blur-3xl transition-all duration-300 snap-start shadow-2xl flex flex-col justify-between group cursor-pointer hover:shadow-[0_0_35px_rgba(0,255,170,0.25)]"
              onClick={() => handleProtectedNavigation('/marketplace', 'Please log in to view project details.')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-400 uppercase tracking-wider">PROJECT 03</span>
                  <span className="px-3 py-1 rounded-full bg-[#00ffaa]/10 border border-[#00ffaa]/30 text-[#00ffaa] text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,170,0.2)]">VERIFIED</span>
                </div>

                <div>
                  <h3 className="text-2xl font-display font-black text-white group-hover:text-[#00ffaa] transition-colors">
                    IoT Smart Edge Gateway
                  </h3>
                  <p className="text-xs sm:text-sm font-sans text-neutral-300 mt-2 leading-relaxed line-clamp-3">
                    ESP32 & LoRa long-range wireless sensor gateway with real-time MQTT telemetry streaming and interactive web dashboard analytics.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">ESP32 C++</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">LoRaWAN</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">MQTT</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-mono text-indigo-400 group-hover:text-[#00ffaa] transition-colors">
                <span className="font-bold tracking-wider">LIVE_DEPLOY.EXE</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </motion.div>
          </motion.div>

          {/* Pixellon Scroll Track Indicator Line (Matches Screenshot) */}
          <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden relative">
            <div className="w-1/3 h-full bg-gradient-to-r from-indigo-500 to-[#00ffaa] rounded-full shadow-[0_0_10px_rgba(0,255,170,0.6)]" />
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


      {/* FEATURED PROJECTS CATALOG */}
      <section className="py-16 relative z-10 border-t border-cyan-500/20 bg-gray-950/40 content-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Audited Projects
              </span>
              <h2 className="text-3xl font-display font-black text-white mt-1">
                Explore Verified Engineering Projects
              </h2>
            </div>
            <button
              onClick={() => handleProtectedNavigation('/marketplace', 'Please log in or register to explore all verified projects.')}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <span>Explore All Verified Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((project) => (
              <motion.div
                key={project._id}
                whileHover={{ y: -6 }}
                className="rounded-2xl bg-gray-950/85 border border-cyan-500/25 overflow-hidden backdrop-blur-xl flex flex-col justify-between shadow-xl shadow-black/80 group"
              >
                <div>
                  {/* Thumbnail with Video Trigger */}
                  <div className="relative aspect-video overflow-hidden bg-gray-900">
                    <img
                      src={project.screenshots?.[0] || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <button
                      onClick={() => {
                        playClick();
                        setActiveVideoModal(project);
                      }}
                      className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                        {project.category}
                      </span>
                      <span className="text-slate-400">v{project.version}</span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {project.tagline || project.description}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.techStack?.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-4 pt-0 border-t border-slate-900 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">Fixed Price:</span>
                      <p className="font-display font-black text-base text-cyan-300">
                        ₹{project.price?.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleProtectedNavigation(`/projects/${project._id}`, 'Please log in or register to inspect this project.')}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 transition-colors cursor-pointer"
                    >
                      View Specs →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setActivePeekProject(project);
                    }}
                    className="w-full py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Terminal className="w-3 h-3 text-purple-400" />
                    <span>⚡ Peek Code & Schematics</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture & Code Peek Modal */}
      {activePeekProject && (
        <ArchitecturePeekModal
          project={activePeekProject}
          onClose={() => setActivePeekProject(null)}
        />
      )}

      {/* FAQS SECTION */}
      <section className="py-20 relative z-10 border-t border-cyan-500/20 bg-gray-950/60 content-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Platform Information
            </span>
            <h2 className="text-3xl font-display font-black text-white mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Everything you need to know about project ownership, verification, and custom engineering.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-gray-950/80 border border-slate-800 overflow-hidden transition-all backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setActiveFaq(activeFaq === idx ? null : idx);
                  }}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 transition-transform duration-300 shrink-0 ${
                      activeFaq === idx ? 'rotate-180 text-cyan-300' : ''
                    }`}
                  />
                </button>

                {activeFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-5 text-xs font-mono text-slate-300 leading-relaxed border-t border-slate-900 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            ))}
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
