import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Shield,
  ShieldCheck,
  Cpu,
  Code,
  Layers,
  ArrowRight,
  Play,
  RotateCw,
  Sliders,
  Eye,
  CheckCircle2,
  Terminal,
  Activity,
  MessageSquare,
  UploadCloud,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Info,
  MousePointer,
  Sparkle,
  SlidersHorizontal,
  Flame,
  Star,
  Compass,
  Radio,
  Share2,
} from 'lucide-react';

// React Bits & Motion Components
import SpotlightCard from '../components/reactbits/SpotlightCard';
import DecryptedText from '../components/reactbits/DecryptedText';
import BlurText from '../components/reactbits/BlurText';
import TiltedCard from '../components/reactbits/TiltedCard';
import MagneticButton from '../components/reactbits/MagneticButton';
import ShinyText from '../components/reactbits/ShinyText';
import StarBorder from '../components/reactbits/StarBorder';
import FloatingDock from '../components/reactbits/FloatingDock';

// Background and utilities
import AuroraBackground from '../components/ui/AuroraBackground';
import CyberParticles from '../components/ui/CyberParticles';
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';

const MotionDemoPage = () => {
  const navigate = useNavigate();
  const { playClick, playHover, playSuccess, playShield } = useSound();

  // Active View Mode: 'redesign' | 'playground' | 'comparison'
  const [activeTab, setActiveTab] = useState('redesign');

  // Playground Interactive States
  const [spotlightTheme, setSpotlightTheme] = useState('cyan');
  const [decryptedInput, setDecryptedInput] = useState('PROJECTXIA // NEXT-GEN AGENTIC CORE');
  const [decryptedKey, setDecryptedKey] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(15);
  const [magneticPower, setMagneticPower] = useState(0.4);
  const [blurTextKey, setBlurTextKey] = useState(0);
  const [blurDirection, setBlurDirection] = useState('top');
  const [copiedComponent, setCopiedComponent] = useState(null);

  // Live Simulated Scan in Redesign View
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Active Filter for demo marketplace showcase
  const [activeCategory, setActiveCategory] = useState('All');

  const runSimulatedScan = () => {
    playShield();
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanResult({
            trustScore: 99.8,
            plagiarism: '0.2%',
            codeAuthenticity: '100% Original AST Match',
          });
          playSuccess();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          return 100;
        }
        return prev + 18;
      });
    }, 120);
  };

  const copyCodeToClipboard = (componentName, code) => {
    playClick();
    navigator.clipboard.writeText(code);
    setCopiedComponent(componentName);
    setTimeout(() => setCopiedComponent(null), 2000);
  };

  // Demo Project Data for Cards
  const demoProjects = [
    {
      id: 'demo-1',
      title: 'Autonomous IoT Quadcopter with Edge AI Computer Vision',
      dept: 'Robotics & AI',
      price: '₹3,499',
      originalPrice: '₹5,999',
      trustScore: 99,
      tags: ['ESP32', 'OpenCV', 'ROS 2', 'Python'],
      downloads: 142,
      rating: 4.9,
      author: 'Aarav Sharma (IIT Bombay)',
      gradient: 'from-cyan-500/20 to-blue-500/10',
      badgeColor: 'cyan',
    },
    {
      id: 'demo-2',
      title: 'Quantum-Safe Decentralized Medical Records Vault',
      dept: 'Cyber Security',
      price: '₹2,899',
      originalPrice: '₹4,500',
      trustScore: 98,
      tags: ['Solidity', 'IPFS', 'Next.js', 'Post-Quantum Kyber'],
      downloads: 98,
      rating: 5.0,
      author: 'Priya Patel (NIT Trichy)',
      gradient: 'from-purple-500/20 to-indigo-500/10',
      badgeColor: 'purple',
    },
    {
      id: 'demo-3',
      title: 'Smart EV Battery Management System with Thermal AI',
      dept: 'Electrical & EEE',
      price: '₹4,199',
      originalPrice: '₹6,800',
      trustScore: 100,
      tags: ['CAN-Bus', 'MATLAB', 'STM32', 'TensorFlow Lite'],
      downloads: 210,
      rating: 4.9,
      author: 'Vikram Menon (BITS Pilani)',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      badgeColor: 'emerald',
    },
  ];

  // Floating Dock Items
  const dockItems = [
    {
      title: 'Explore Demo',
      icon: Compass,
      active: activeTab === 'redesign',
      onClick: () => {
        playClick();
        setActiveTab('redesign');
      },
    },
    {
      title: 'Component Lab',
      icon: SlidersHorizontal,
      active: activeTab === 'playground',
      onClick: () => {
        playClick();
        setActiveTab('playground');
      },
    },
    {
      title: 'Comparison',
      icon: Eye,
      active: activeTab === 'comparison',
      onClick: () => {
        playClick();
        setActiveTab('comparison');
      },
    },
    {
      title: 'AI Scanner Test',
      icon: ShieldCheck,
      badge: '99%',
      onClick: () => {
        setActiveTab('redesign');
        runSimulatedScan();
      },
    },
    {
      title: 'Back to Original',
      icon: ExternalLink,
      onClick: () => {
        playClick();
        navigate('/');
      },
    },
  ];

  return (
    <div className="relative min-h-screen pb-32 overflow-x-hidden selection:bg-cyan-400 selection:text-black">
      {/* Background Matrix and Lights */}
      <AuroraBackground theme="cyan" className="opacity-70" />
      <CyberParticles />

      {/* Top Demo Banner */}
      <div className="relative z-20 border-b border-cyan-500/30 bg-cyan-950/40 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono font-bold text-cyan-300">
              [LIVE PREVIEW MODE]
            </span>
            <span className="text-slate-300">
              Non-destructive Demo with React Bits & Motion.io components.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playClick();
                navigate('/');
              }}
              className="text-slate-400 hover:text-white transition-colors underline flex items-center gap-1 font-mono cursor-pointer"
            >
              Return to Original Site
            </button>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
              60 FPS Physics
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Navigation Mode Switcher Bar */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.15)]">
            {[
              { id: 'redesign', label: '🌟 Redesigned Concept', icon: Sparkles },
              { id: 'playground', label: '🧪 Component Lab (Playground)', icon: SlidersHorizontal },
              { id: 'comparison', label: '⚖️ Before vs After', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playClick();
                  setActiveTab(tab.id);
                }}
                className={`relative px-5 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabPill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 shadow-neon-cyan"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'text-cyan-400'}`} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: REDESIGNED CONCEPT (LIVE PREVIEW OF PROJECTXIA WITH REACT BITS)   */}
        {/* ========================================================================= */}
        {activeTab === 'redesign' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-16"
          >
            {/* HERO SECTION WITH BLURTEXT, DECRYPTEDTEXT & MAGNETIC BUTTONS */}
            <div className="text-center max-w-4xl mx-auto space-y-7 pt-4">
              {/* React Bits Decrypted Cyber Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/50 backdrop-blur-xl shadow-neon-cyan">
                <Sparkle className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <DecryptedText
                  text="VERIFIED ENGINEERING ECOSYSTEM // CSE • ECE • AI • ROBOTICS"
                  speed={30}
                  className="text-xs font-mono font-bold text-cyan-300 tracking-wider"
                  encryptedClassName="text-xs font-mono font-bold text-cyan-400 opacity-70"
                  animateOn="hover"
                />
              </div>

              {/* BlurText Fluid Spring Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.08]">
                <BlurText
                  text="Where Creators Build,"
                  delay={60}
                  animateBy="words"
                  direction="top"
                  className="justify-center"
                />
                <br />
                <ShinyText
                  text="Monetize & Verify Projects"
                  textColor="#00f0ff"
                  shimmerColor="#ffffff"
                  speed={3.5}
                  className="text-4xl sm:text-6xl lg:text-7xl"
                />
              </h1>

              {/* Subheadline with BlurText */}
              <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-2xl mx-auto">
                <BlurText
                  text="Download 100% verified working source code, 4K prototype videos, schematics, and zero-plagiarism reports — built with React Bits & Framer Motion micro-interactions."
                  delay={25}
                  animateBy="words"
                  direction="bottom"
                  className="justify-center"
                />
              </p>

              {/* Magnetic Interactive CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
                <MagneticButton
                  strength={0.4}
                  onClick={() => {
                    playSuccess();
                    confetti({ particleCount: 80, spread: 70 });
                  }}
                  className="px-7 py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-black font-display font-black text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2 hover:brightness-110"
                >
                  <Code className="w-4 h-4 text-black" />
                  <span>Explore 250+ Verified Projects</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </MagneticButton>

                <MagneticButton
                  strength={0.3}
                  onClick={runSimulatedScan}
                  className="px-6 py-4 rounded-xl bg-slate-900/90 border border-purple-500/50 text-purple-300 font-display font-bold text-sm flex items-center gap-2 hover:border-purple-400 hover:text-white shadow-[0_0_20px_rgba(157,78,221,0.25)]"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Run Plagiarism Shield</span>
                </MagneticButton>

                <MagneticButton
                  strength={0.3}
                  onClick={() => {
                    playClick();
                    confetti({ particleCount: 40, spread: 50 });
                  }}
                  className="px-5 py-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-display font-bold text-sm flex items-center gap-2 hover:bg-emerald-900/80"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>+ List Your Hardware Kit</span>
                </MagneticButton>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* REACT BITS BENTO GRID SHOWCASE (4 PILLARS WITH LIVE INTERACTIVE WIDGETS) */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-black text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-cyan-400" />
                    <span>Next-Gen Bento Architecture</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    React Bits interactive spatial grid with responsive hover spotlights.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
                  4 Interactive Nodes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Node 1: Large Bento Spotlight Card (Verified Marketplace Engine) */}
                <SpotlightCard
                  spotlightColor="rgba(0, 240, 255, 0.22)"
                  borderColor="rgba(0, 240, 255, 0.5)"
                  className="md:col-span-2 p-6 flex flex-col justify-between min-h-[260px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
                        <Code className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Marketplace
                      </span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-white">
                      Instant Working Code, Schematics & 4K Walkthroughs
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                      Every project is peer-reviewed by engineering mentors. Test circuit schematics, download simulation testbenches, and verify working hardware before buying.
                    </p>
                  </div>

                  {/* Interactive Mini Tech Ticker */}
                  <div className="pt-4 flex flex-wrap items-center gap-2">
                    {['TensorFlow 2.0', 'ESP32 / Arduino', 'ROS 2 Robotics', 'Next.js 14', 'Post-Quantum Cryptography'].map((tech, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/70 text-[11px] font-mono text-cyan-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>

                {/* Node 2: Interactive AI Plagiarism Scanner Bento Card */}
                <SpotlightCard
                  spotlightColor="rgba(157, 78, 221, 0.25)"
                  borderColor="rgba(157, 78, 221, 0.5)"
                  className="p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono text-purple-300">AI Shield v3</span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-white">
                      Code Integrity Scanner
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Instant AST syntax tree analysis comparing against 50,000+ IEEE repositories.
                    </p>
                  </div>

                  {/* Live Interactive Scanner Gauge */}
                  <div className="pt-4 space-y-2">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30">
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-400">Authenticity Score</span>
                        <span className="text-purple-300 font-bold">
                          {isScanning ? `${scanProgress}% Scanning...` : scanResult ? `${scanResult.trustScore}% Verified` : 'Ready to test'}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                          style={{ width: `${isScanning ? scanProgress : scanResult ? 100 : 35}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={runSimulatedScan}
                      disabled={isScanning}
                      className="w-full py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white text-xs font-mono font-bold border border-purple-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      {isScanning ? 'Analyzing AST...' : 'Trigger Integrity Check'}
                    </button>
                  </div>
                </SpotlightCard>

                {/* Node 3: Direct Creator WhatsApp-style Chat Room Preview */}
                <SpotlightCard
                  spotlightColor="rgba(16, 185, 129, 0.22)"
                  borderColor="rgba(16, 185, 129, 0.5)"
                  className="p-6 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Creator Online
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-white">
                      Direct Creator Connect
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Instant audio pings, socket messaging & hardware delivery tracking.
                    </p>
                  </div>

                  <div className="pt-3">
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs space-y-2 font-sans">
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                        💬 "I can flash the firmware and ship the assembled PCB tomorrow!"
                      </div>
                      <button
                        onClick={() => {
                          playClick();
                          confetti({ particleCount: 30, spread: 40 });
                        }}
                        className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold transition-all cursor-pointer"
                      >
                        Ping Audio Bell 🔔
                      </button>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Node 4: Custom Hardware & Software Engineering Lab */}
                <SpotlightCard
                  spotlightColor="rgba(255, 215, 0, 0.2)"
                  borderColor="rgba(255, 215, 0, 0.45)"
                  className="md:col-span-2 p-6 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 w-fit">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40">
                        Custom Lab Service
                      </span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-white">
                      Custom Hardware & AI Model Synthesis
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                      Have a capstone project or startup prototype idea? Submit your requirements and our verified engineering syndicate designs, solders, codes, and ships it to your doorstep.
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>✓ 48-Hour Turnaround</span>
                      <span>✓ IEEE Format Synopsis</span>
                      <span>✓ Full 1080p Video</span>
                    </div>

                    <MagneticButton
                      strength={0.3}
                      onClick={() => {
                        playSuccess();
                        confetti({ particleCount: 50, spread: 60 });
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-400 text-black font-display font-black text-xs hover:bg-amber-300 transition-colors"
                    >
                      Request Custom Build →
                    </MagneticButton>
                  </div>
                </SpotlightCard>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* REACT BITS 3D TILT CARDS & SPOTLIGHT PROJECT SHOWCASE                     */}
            {/* ========================================================================= */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-black text-white flex items-center gap-2">
                    <Flame className="w-6 h-6 text-amber-400" />
                    <span>Featured 3D Tilt Project Cards</span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Hover mouse over cards to experience real-time 3D perspective gyro and specular glare reflections.
                  </p>
                </div>

                {/* Filter Pills with Framer Motion LayoutId */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  {['All', 'Robotics & AI', 'Cyber Security', 'Electrical'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        playClick();
                        setActiveCategory(cat);
                      }}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        activeCategory === cat ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {activeCategory === cat && (
                        <motion.div
                          layoutId="categoryPill"
                          className="absolute inset-0 rounded-lg bg-cyan-950/80 border border-cyan-500/50"
                        />
                      )}
                      <span className="relative z-10">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Tilt Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {demoProjects.map((project, idx) => (
                  <TiltedCard
                    key={project.id}
                    maxTilt={18}
                    scale={1.03}
                    glareEnable={true}
                    glareColor="#00f0ff"
                    glareMaxOpacity={0.25}
                    className="p-6 h-full flex flex-col justify-between border-slate-800 hover:border-cyan-500/60 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                  >
                    <div className="space-y-4">
                      {/* Department and Score Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold">
                          {project.dept}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {project.trustScore}% Score
                        </span>
                      </div>

                      {/* Project Title */}
                      <h4 className="text-base font-display font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">
                        {project.title}
                      </h4>

                      {/* Author */}
                      <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {project.author}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price and Download Action */}
                    <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400 line-through">{project.originalPrice}</div>
                        <div className="text-xl font-display font-black text-cyan-300">{project.price}</div>
                      </div>

                      <MagneticButton
                        strength={0.25}
                        onClick={() => {
                          playSuccess();
                          confetti({ particleCount: 45, spread: 60 });
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs shadow-neon-cyan flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-black text-black" />
                        <span>Instant Demo</span>
                      </MagneticButton>
                    </div>
                  </TiltedCard>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: COMPONENT LAB & PLAYGROUND (HANDS-ON SANDBOX FOR REACT BITS)      */}
        {/* ========================================================================= */}
        {activeTab === 'playground' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-display font-black text-white">
                React Bits Component Laboratory
              </h2>
              <p className="text-slate-300 text-xs font-mono">
                Test each component's physics, sliders, colors, and motion settings live.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. SPOTLIGHT CARD SANDBOX */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <span>SpotlightCard Sandbox</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Tracks mouse coordinates to project radial illumination onto the card surface.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      copyCodeToClipboard(
                        'SpotlightCard',
                        `<SpotlightCard spotlightColor="${
                          spotlightTheme === 'cyan'
                            ? 'rgba(0, 240, 255, 0.25)'
                            : spotlightTheme === 'purple'
                            ? 'rgba(157, 78, 221, 0.25)'
                            : 'rgba(16, 185, 129, 0.25)'
                        }">\n  <h3>Interactive Card</h3>\n</SpotlightCard>`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedComponent === 'SpotlightCard' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedComponent === 'SpotlightCard' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Color Selector */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Spotlight Color:</span>
                  {['cyan', 'purple', 'emerald', 'gold'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSpotlightTheme(c)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                        spotlightTheme === c
                          ? 'bg-cyan-500 text-black shadow-neon-cyan'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Live Sandbox Card */}
                <SpotlightCard
                  spotlightColor={
                    spotlightTheme === 'cyan'
                      ? 'rgba(0, 240, 255, 0.3)'
                      : spotlightTheme === 'purple'
                      ? 'rgba(157, 78, 221, 0.3)'
                      : spotlightTheme === 'emerald'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(255, 215, 0, 0.3)'
                  }
                  borderColor={
                    spotlightTheme === 'cyan'
                      ? 'rgba(0, 240, 255, 0.6)'
                      : spotlightTheme === 'purple'
                      ? 'rgba(157, 78, 221, 0.6)'
                      : spotlightTheme === 'emerald'
                      ? 'rgba(16, 185, 129, 0.6)'
                      : 'rgba(255, 215, 0, 0.6)'
                  }
                  className="p-8 text-center space-y-3 cursor-pointer min-h-[160px] flex flex-col justify-center items-center"
                >
                  <MousePointer className="w-6 h-6 text-cyan-400 animate-bounce" />
                  <h4 className="text-lg font-display font-bold text-white">
                    Move your cursor anywhere over this card!
                  </h4>
                  <p className="text-xs text-slate-300 max-w-sm">
                    Notice how the radial glow follows your exact mouse coordinates with smooth backdrop blur.
                  </p>
                </SpotlightCard>
              </div>

              {/* 2. DECRYPTED TEXT SANDBOX */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-purple-400" />
                      <span>DecryptedText Sandbox</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Cyberpunk character scrambling matrix that resolves into plaintext.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      copyCodeToClipboard(
                        'DecryptedText',
                        `<DecryptedText text="${decryptedInput}" speed={35} animateOn="hover" />`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedComponent === 'DecryptedText' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedComponent === 'DecryptedText' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Input string */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400">Custom Text to Decrypt:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={decryptedInput}
                      onChange={(e) => setDecryptedInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs focus:border-cyan-400 outline-none"
                    />
                    <button
                      onClick={() => setDecryptedKey((prev) => prev + 1)}
                      className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold cursor-pointer"
                    >
                      Trigger
                    </button>
                  </div>
                </div>

                {/* Output Display */}
                <div className="p-8 rounded-xl bg-slate-950/90 border border-purple-500/30 text-center min-h-[120px] flex flex-col justify-center items-center">
                  <span className="text-xs font-mono text-slate-500 mb-2">Hover or Click Below:</span>
                  <DecryptedText
                    key={decryptedKey}
                    text={decryptedInput || 'PROJECTXIA // CYBER CORE'}
                    speed={30}
                    className="text-lg sm:text-xl font-display font-black text-cyan-300 tracking-wide"
                    encryptedClassName="text-lg sm:text-xl font-mono font-bold text-purple-400 opacity-80"
                    animateOn="both"
                  />
                </div>
              </div>

              {/* 3. 3D TILTED CARD SANDBOX */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-emerald-400" />
                      <span>3D TiltedCard Sandbox</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Real-time perspective rotation physics with mouse coordinate mapping.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      copyCodeToClipboard(
                        'TiltedCard',
                        `<TiltedCard maxTilt={${tiltAngle}} scale={1.05} glareEnable={true}>\n  <div>3D Project</div>\n</TiltedCard>`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedComponent === 'TiltedCard' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedComponent === 'TiltedCard' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Tilt Slider */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Max Tilt Angle:</span>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={tiltAngle}
                    onChange={(e) => setTiltAngle(Number(e.target.value))}
                    className="flex-1 accent-emerald-400"
                  />
                  <span className="text-emerald-300 font-bold">{tiltAngle}°</span>
                </div>

                {/* Live Tilted Card */}
                <TiltedCard
                  maxTilt={tiltAngle}
                  scale={1.05}
                  glareEnable={true}
                  glareColor="#10b981"
                  className="p-8 text-center bg-gradient-to-tr from-slate-900 to-emerald-950/40 border-emerald-500/40 cursor-pointer min-h-[160px] flex flex-col justify-center items-center"
                >
                  <Cpu className="w-8 h-8 text-emerald-400 mb-2" />
                  <h4 className="text-base font-display font-bold text-white">
                    3D Perspective Gyroactive Container
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Tilt strength currently set to <strong className="text-emerald-300">{tiltAngle}°</strong>
                  </p>
                </TiltedCard>
              </div>

              {/* 4. MAGNETIC BUTTON SANDBOX */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span>MagneticButton Sandbox</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Spring-attraction physics that pulls elements toward your cursor.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      copyCodeToClipboard(
                        'MagneticButton',
                        `<MagneticButton strength={${magneticPower}}>\n  <span>Magnetic Action</span>\n</MagneticButton>`
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedComponent === 'MagneticButton' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedComponent === 'MagneticButton' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Magnetic Slider */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Attraction Strength:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={magneticPower}
                    onChange={(e) => setMagneticPower(Number(e.target.value))}
                    className="flex-1 accent-amber-400"
                  />
                  <span className="text-amber-300 font-bold">{magneticPower}x</span>
                </div>

                {/* Interactive Sandbox Area */}
                <div className="p-8 rounded-xl bg-slate-950/90 border border-amber-500/30 flex items-center justify-center gap-4 min-h-[160px]">
                  <MagneticButton
                    strength={magneticPower}
                    onClick={() => {
                      playSuccess();
                      confetti({ particleCount: 30, spread: 40 });
                    }}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-display font-black text-xs shadow-lg shadow-amber-500/20"
                  >
                    <span>⚡ Magnetic Pull Me!</span>
                  </MagneticButton>

                  <MagneticButton
                    strength={magneticPower}
                    onClick={() => playClick()}
                    className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-400/50 text-amber-300 font-mono text-xs font-bold"
                  >
                    <span>Magnetic Secondary</span>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BEFORE VS AFTER COMPARISON                                         */}
        {/* ========================================================================= */}
        {activeTab === 'comparison' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-display font-black text-white">
                UI & Motion Architectural Analysis
              </h2>
              <p className="text-slate-300 text-xs font-mono">
                Comparative analysis of traditional static UI vs Motion.io & React Bits dynamic physics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Classic UI */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-400 uppercase">Original Static Pattern</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono">Standard CSS</span>
                </div>

                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-3">
                  <div className="h-6 w-32 bg-slate-800 rounded" />
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">
                    Static Button
                  </button>
                </div>

                <ul className="space-y-2 text-xs text-slate-400 font-mono">
                  <li>• Fixed CSS transforms without spring physics</li>
                  <li>• Static text rendering without viewport reveal</li>
                  <li>• Traditional 2D box shadows and static borders</li>
                  <li>• Rigid grid without interactive cursor lighting</li>
                </ul>
              </div>

              {/* Right: React Bits & Motion UI */}
              <div className="p-6 rounded-2xl bg-cyan-950/30 border border-cyan-500/50 space-y-4 shadow-neon-cyan">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                  <span className="text-xs font-mono text-cyan-300 uppercase font-bold">✨ React Bits & Motion Pattern</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">Spring Physics</span>
                </div>

                <TiltedCard maxTilt={10} scale={1.02} glareEnable={true} className="p-6 text-left space-y-3 border-cyan-500/40">
                  <ShinyText text="Next-Gen Spatial Dynamic Card" textColor="#00f0ff" className="text-sm" />
                  <p className="text-xs text-slate-300">
                    Smooth 3D gyro tilt with cursor-following specular glare & spring velocity.
                  </p>
                  <MagneticButton
                    strength={0.3}
                    className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold shadow-neon-cyan"
                  >
                    Magnetic Spring CTA
                  </MagneticButton>
                </TiltedCard>

                <ul className="space-y-2 text-xs text-cyan-300 font-mono">
                  <li>✓ 60 FPS GPU-accelerated spring animations</li>
                  <li>✓ DecryptedText & BlurText for captivating typography</li>
                  <li>✓ Cursor-tracking radial spotlights and 3D gyro tilt</li>
                  <li>✓ Magnification floating docks for tactile UX delight</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Persistent React Bits Magnification Floating Dock */}
      <FloatingDock items={dockItems} />
    </div>
  );
};

export default MotionDemoPage;
