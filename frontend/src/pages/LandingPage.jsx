import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
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
} from 'lucide-react';
import AuroraBackground from '../components/ui/AuroraBackground';
import CyberParticles from '../components/ui/CyberParticles';
import ThreeDCanvas from '../components/ui/ThreeDCanvas';
import TrustScoreBadge from '../components/ui/TrustScoreBadge';
import VideoPlayerModal from '../components/ui/VideoPlayerModal';
import ArchitecturePeekModal from '../components/ui/ArchitecturePeekModal';
import Interactive3DViewer from '../components/ui/Interactive3DViewer';
import LiveCyberTerminal from '../components/ui/LiveCyberTerminal';
import CustomDevModal from '../components/ui/CustomDevModal';
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
      navigate('/marketplace');
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
      navigate('/marketplace');
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

  const departments = [
    { name: 'Computer Science (CSE / IT)', count: '65+ Projects', icon: Code, desc: 'Web apps, AI/ML, Cloud & Cyber Security' },
    { name: 'Electronics & Comm (ECE)', count: '38+ Projects', icon: Cpu, desc: 'IoT, LoRaWAN, ESP32, VLSI & Signal Processing' },
    { name: 'Electrical Engineering (EEE)', count: '24+ Projects', icon: Zap, desc: 'EV charging, Solar microgrids & Power systems' },
    { name: 'Mechanical & Robotics', count: '19+ Projects', icon: Settings, desc: 'ROS2 robotics, 3D CAD models & Rover setups' },
    { name: 'Artificial Intelligence & DS', count: '42+ Projects', icon: Sparkles, desc: 'Deep learning, Edge vision & LLM pipelines' },
    { name: 'Blockchain & zk-SNARK', count: '18+ Projects', icon: Layers, desc: 'Smart contracts, Escrow protocols & Web3 dApps' },
  ];

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
      <AuroraBackground theme="cyan" className="opacity-80" />
      <CyberParticles />

      {/* 3D VIDEO & PARTICLES HERO SECTION WITH INTEGRATED AUTH CARD */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Background Ambient Video Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-35 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter blur-[1px] scale-105"
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31911-large.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/30 via-transparent to-[#030712]/50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT HERO TEXT COLUMN */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Ultra-Futuristic Shimmer Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-950/80 via-purple-950/60 to-cyan-950/80 border border-cyan-400/50 backdrop-blur-xl shadow-neon-cyan"
              >
                <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-300">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  ⚡ Next-Gen Engineering Ecosystem • All Departments
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping ml-1" />
              </motion.div>

              {/* Main Headline with High-End Syne Typography */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.08]"
              >
                Where Engineering Innovators <br />
                <span className="text-gradient-cyan">Buy, Sell & Build Genuine Projects</span>
              </motion.h1>

              {/* Mission Statement */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl"
              >
                The verified ecosystem for engineering students, creators, and researchers across <strong className="text-cyan-300 font-bold">CSE, ECE, EEE, Mech, AI, and IoT</strong>. Complete source code, circuit schematics, 4K video walkthroughs, built-in code originality check, and our dedicated custom engineering team.
              </motion.p>

              {/* CTA Action Buttons with Auth Gates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/marketplace', 'Please log in or register to explore verified engineering projects.')}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSuccess();
                    setIsDevModalOpen(true);
                  }}
                  className="px-7 py-3.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/40 backdrop-blur-md text-purple-200 font-display font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-neon-purple cursor-pointer"
                >
                  <Code className="w-4 h-4 text-purple-400" />
                  <span>Build My Idea (Custom Team)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProtectedNavigation('/upload', 'Please log in or register to upload and monetize your project.')}
                  className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-mono text-xs transition-all cursor-pointer"
                >
                  + Sell a Project
                </button>
              </motion.div>

              {/* Pillars Highlight Bar */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono text-slate-300">
                <div className="p-3 rounded-2xl bg-gray-900/70 border border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Working 4K Video & Fixed Price</span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-900/70 border border-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Plagiarism Checker Passed</span>
                </div>
              </div>

              {/* Live Embedded Engineering Terminal */}
              <div className="pt-2">
                <LiveCyberTerminal />
              </div>
            </div>

            {/* RIGHT COLUMN: 3D INTERACTIVE HARDWARE VIEWER & FAST AUTH WIDGET */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center space-y-4">
              {/* Interactive 3D Model & Hardware Circuit Inspector */}
              <div className="w-full">
                <Interactive3DViewer projectTitle="ESP32-S3 Neural Vision & Edge AI Node" />
              </div>

              {isAuthenticated ? (
                /* Authenticated Innovator Status Box */
                <div className="w-full rounded-3xl p-5 bg-gray-950/90 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg bg-gray-900"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-display font-bold text-white">
                          {user?.name || user?.email?.split('@')?.[0] || 'Innovator'}
                        </h3>
                        <UserCheck className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-[11px] font-mono text-cyan-400">
                        {String(user?.role || 'member').toUpperCase()} • {user?.email || 'Logged In'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-center transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                    >
                      Browse Projects
                    </button>
                    <button
                      onClick={() => navigate('/profile')}
                      className="py-2.5 px-3 rounded-xl bg-gray-900 border border-cyan-500/30 text-cyan-300 font-bold text-center hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate('/upload')}
                      className="py-2.5 px-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-center hover:bg-purple-500/30 transition-all cursor-pointer"
                    >
                      Sell Project
                    </button>
                    <button
                      onClick={() => navigate('/ai-shield')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center hover:bg-emerald-500/30 transition-all cursor-pointer"
                    >
                      Plagiarism Check
                    </button>
                  </div>
                </div>
              ) : (
                /* Landing Page Direct Fast Login Card */
                <div className="w-full rounded-3xl p-5 bg-gray-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        Instant Member Access
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      1-Click Unlocked
                    </span>
                  </div>

                  {/* Google Sign-In with 1-Click Popup */}
                  <button
                    type="button"
                    onClick={handleInlineGoogle}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-cyan-400 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-lg"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {inlineAuthMsg && (
                    <div className="p-2.5 bg-rose-950/70 border border-rose-500/40 rounded-xl text-[11px] font-mono text-rose-300 space-y-1.5">
                      <p>{inlineAuthMsg}</p>
                      {showAutoRegisterBtn && (
                        <button
                          type="button"
                          onClick={handleInlineAutoRegister}
                          className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>⚡ Auto-Register & Sign In Now</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Inline Email / Password Form */}
                  <form onSubmit={handleInlineLogin} className="space-y-2 text-xs font-mono">
                    <div>
                      <input
                        type="email"
                        required
                        value={inlineEmail}
                        onChange={(e) => setInlineEmail(e.target.value)}
                        placeholder="Enter your email id"
                        className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        required
                        value={inlinePassword}
                        onChange={(e) => setInlinePassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-gray-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={inlineLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {inlineLoading ? 'Authenticating...' : 'Sign In with Email & Password'}
                    </button>

                    <div className="flex justify-between items-center pt-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => openAuthModal('register')}
                        className="text-cyan-400 font-bold hover:underline cursor-pointer"
                      >
                        Create Account
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          openAuthModal('forgot');
                        }}
                        className="text-slate-400 hover:text-cyan-300 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BUILT-IN PLAGIARISM CHECKER & SCAM SHIELD SECTION */}
      <section className="py-16 relative z-10 border-y border-cyan-500/20 bg-gray-950/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-b from-gray-950/90 via-purple-950/20 to-gray-950/90 border border-purple-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="scanline-overlay absolute inset-0 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  Built-In Engineering Plagiarism & Originality Checker
                </span>
                <h3 className="text-2xl font-display font-black text-white mt-1">
                  Verify Abstract, Code & Hardware Originality
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  To prevent fake projects or plagiarism, every upload is scanned before publication.
                </p>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
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
                  className="flex-1 bg-gray-900 border border-purple-500/30 focus:border-purple-400 rounded-xl px-4 py-3 text-sm text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleSimulatedScan}
                  disabled={isScanning}
                  className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 transition-all cursor-pointer"
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
                  className="p-4 rounded-xl bg-gray-900 border border-purple-500/40 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono"
                >
                  <div className="sm:col-span-2">
                    <p className="text-slate-400">Shield Verdict:</p>
                    <p className="text-purple-300 font-bold text-sm mt-0.5">{scanOutput.verdict}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Originality Score:</p>
                    <p className="text-emerald-400 font-bold text-lg">{scanOutput.trustScore}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Plagiarism Index:</p>
                    <p className="text-cyan-400 font-bold text-lg">{scanOutput.plagiarism}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTXIA IN-HOUSE CUSTOM DEVELOPMENT AGENCY SECTION */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-gray-950 via-cyan-950/30 to-purple-950/30 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                  <Code className="w-3.5 h-3.5" />
                  <span>PROJECTXIA WEB & HARDWARE DEVELOPMENT TEAM</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
                  Have a Startup Idea or Need a Final Year Build? We Build It for You!
                </h2>

                <p className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed max-w-2xl">
                  Don't have time to build or need custom guidance? Our in-house engineering team designs and develops custom web apps, mobile apps, IoT hardware setups, AI models, and robotics projects from scratch with complete runbook documentation and milestone video walkthroughs.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSuccess();
                      setIsDevModalOpen(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4" />
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
          </div>
        </div>
      </section>

      {/* DEPARTMENT SPECIALIZATIONS (CSE, ECE, EEE, MECH, AI, BLOCKCHAIN) */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Engineered for All Departments
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white mt-1">
              Hardware & Software Across Engineering Branches
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-2">
              Every department can list their original innovations or discover verified projects.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => {
              const Icon = dept.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleProtectedNavigation(`/marketplace?category=${encodeURIComponent(dept.name)}`, 'Please log in or register to browse department projects.')}
                  className="p-6 rounded-2xl bg-gray-950/80 border border-cyan-500/20 backdrop-blur-xl hover:border-cyan-400 hover:scale-[1.02] transition-all flex flex-col justify-between group shadow-xl cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-base text-white">{dept.name}</h4>
                      <span className="text-xs font-mono text-cyan-400">{dept.count}</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-400">{dept.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS CATALOG */}
      <section className="py-16 relative z-10 border-t border-cyan-500/20 bg-gray-950/40">
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
      <section className="py-20 relative z-10 border-t border-cyan-500/20 bg-gray-950/60">
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

      {/* Custom Dev Inquiry Modal */}
      <CustomDevModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
