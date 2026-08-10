import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Code,
  Sparkles,
  MessageSquare,
  UploadCloud,
  LogOut,
  Volume2,
  VolumeX,
  Menu,
  X,
  Lock,
  ChevronDown,
  Activity,
  LogIn,
  Lightbulb,
  PhoneCall,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useSocket } from '../../context/SocketContext';
import CustomSoftwareRequestModal from './CustomSoftwareRequestModal';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { isMuted, toggleMute, playClick } = useSound();
  const { isConnected } = useSocket();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const navLinks = [
    {
      name: 'Marketplace',
      subtitle: 'Browse & Buy Projects',
      path: '/marketplace',
      icon: Code,
      protected: true,
      description: 'Explore authentic hardware, software, and AI final year projects with verified video demos & source code.',
    },
    {
      name: 'Plagiarism Check',
      subtitle: 'Code Originality Scanner',
      path: '/ai-shield',
      icon: Shield,
      protected: true,
      description: 'Scan code, firmware & IEEE abstracts for plagiarism, security vulnerabilities, and trust score.',
    },
    {
      name: 'Build Custom Software',
      subtitle: 'In-House Dev Team',
      isSpecialAction: true,
      icon: Lightbulb,
      badge: 'DEV TEAM',
      protected: false,
      description: 'Request the ProjectXia engineering team to build your custom software, app, or thesis project with a 12-hour callback.',
    },
    {
      name: 'Sell Project',
      subtitle: 'Monetize Your Code',
      path: '/upload',
      icon: UploadCloud,
      protected: true,
      isHighlight: true,
      description: 'Upload and monetize your original hardware or software projects and receive payouts directly.',
    },
    {
      name: 'Messages & Deals',
      subtitle: 'Direct 1-on-1 Chat',
      path: '/chat',
      icon: MessageSquare,
      protected: true,
      description: 'Chat directly with project creators, ask questions, negotiate prices, and request custom modifications.',
    },
  ];

  const handleNavClick = (link, e) => {
    if (e) e.preventDefault();
    playClick();
    setMobileMenuOpen(false);

    if (link.isSpecialAction) {
      setIsCustomModalOpen(true);
      return;
    }

    if (link.protected && !isAuthenticated) {
      openAuthModal('login', `Please log in or register to access ${link.name} (${link.subtitle}).`);
    } else {
      navigate(link.path);
    }
  };

  const handleLogout = () => {
    playClick();
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/25 bg-black/95 backdrop-blur-2xl shadow-xl shadow-cyan-950/40">
        {/* Top Information & Status Bar */}
        <div className="hidden sm:flex items-center justify-between px-4 sm:px-8 py-1.5 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 border-b border-cyan-500/15 text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400 font-bold">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>PLATFORM STATUS: LIVE & VERIFIED</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">
              🎓 HARDWARE, SOFTWARE & CAPSTONE ENGINEERING HUB
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30"
            >
              <HelpCircle className="w-3 h-3" />
              <span>How It Works / Tabs Guide</span>
            </button>
            <span className="flex items-center gap-1.5 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>REAL-TIME ENGINE: ACTIVE</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
            
            {/* BRAND LOGO */}
            <Link
              to="/"
              onClick={playClick}
              className="flex items-center gap-2 group cursor-pointer shrink-0"
              title="ProjectXia Home"
            >
              <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 border border-cyan-400 shadow-neon-cyan group-hover:scale-105 transition-all">
                <Shield className="w-5 h-5 text-black" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-cyan-300 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-base sm:text-xl tracking-tight text-white">
                  PROJECT<span className="text-cyan-400">XIA</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400 -mt-1 hidden xs:block">
                  Verified Engineering Marketplace
                </span>
              </div>
            </Link>

            {/* Navigation Links with clear purpose styling */}
            <nav className="flex items-center gap-1.5 sm:gap-2">
              {/* 1. Marketplace */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (!isAuthenticated) {
                    openAuthModal('login', 'Please log in or register to explore and access verified engineering projects.');
                  } else {
                    navigate('/marketplace');
                  }
                }}
                title="Browse & Buy Verified Projects with Videos & Source Code"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  location.pathname === '/marketplace'
                    ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-400/50 shadow-neon-cyan'
                    : 'text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span>Marketplace</span>
                </div>
              </button>

              {/* 2. Plagiarism Check */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (!isAuthenticated) {
                    openAuthModal('login', 'Please log in or register to run AI Plagiarism & Code Integrity scans.');
                  } else {
                    navigate('/ai-shield');
                  }
                }}
                title="AI Plagiarism & Code Security Integrity Scanner"
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  location.pathname === '/ai-shield'
                    ? 'text-purple-300 bg-purple-500/25 border border-purple-400/60 shadow-lg'
                    : 'text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="hidden sm:inline">Plagiarism Check</span>
                  <span className="sm:hidden">Shield</span>
                </div>
              </button>

              {/* 3. Build Software Hub (Request Call / Custom Project) */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsCustomModalOpen(true);
                }}
                title="Request ProjectXia Developing Team to Build Your Custom Software from Scratch"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-blue-950/90 border border-purple-500/50 text-purple-300 hover:text-white hover:border-purple-300 shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <div className="flex items-center gap-1">
                  <span className="hidden sm:inline">Build Custom</span>
                  <span className="sm:hidden">Build</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-purple-400 text-black font-extrabold">
                    DEV TEAM
                  </span>
                </div>
              </button>

              {/* 4. Sell Project */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (!isAuthenticated) {
                    openAuthModal('login', 'Please log in or register to publish and sell your engineering project.');
                  } else {
                    navigate('/upload');
                  }
                }}
                title="List your original software/hardware project to earn revenue"
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl font-display font-black text-xs flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/30 border border-cyan-300 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                <UploadCloud className="w-3.5 h-3.5 text-black shrink-0" />
                <span className="hidden xs:inline">Sell Project</span>
                <span className="xs:hidden">Sell</span>
              </button>
            </nav>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Deals & Messages Direct Hub */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (!isAuthenticated) {
                    openAuthModal('login', 'Please log in or register to access Creator Deals & Chat.');
                  } else {
                    navigate('/chat');
                  }
                }}
                title="Live Negotiations & 1-on-1 Deals with Creators"
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all cursor-pointer shadow-md text-xs font-mono font-bold"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden lg:inline">Deals & Chat</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Cyber Audio FX'}
                className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* AUTH STATE: LOGIN/REGISTER vs PROFILE & LOGOUT */}
              {!isAuthenticated ? (
                <button
                  onClick={() => openAuthModal('login', 'Please log in or register to access verified projects.')}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1 transition-all hover:scale-105 cursor-pointer shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login / Register</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-display font-bold text-xs flex items-center gap-1 transition-all hover:scale-105 shadow-md cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>

                  {/* Profile Menu Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        playClick();
                        setUserDropdownOpen(!userDropdownOpen);
                      }}
                      className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover border border-cyan-400/40 bg-gray-900"
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-950/95 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-2xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-cyan-500/20">
                          <p className="text-xs font-bold text-white">{user?.name || user?.email?.split('@')?.[0] || 'Innovator'}</p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2.5 text-xs text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300"
                        >
                          👤 My Profile & Dashboard
                        </Link>

                        <Link
                          to="/profile?tab=software_requests"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2.5 text-xs text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300"
                        >
                          📋 My Custom Build Inquiries
                        </Link>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsCustomModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-cyan-300 font-bold bg-cyan-950/40 hover:bg-cyan-900/60 border-y border-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>💡 Request Custom Software Build</span>
                        </button>

                        {user?.email?.toLowerCase() === 'theprojectxia@gmail.com' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="block px-4 py-2 text-xs text-rose-300 font-bold bg-rose-950/40 hover:bg-rose-900/60 border-y border-rose-500/30 flex items-center gap-1.5"
                          >
                            <Shield className="w-3.5 h-3.5 text-rose-400" />
                            <span>Super Admin HUD & Reports</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 border-t border-cyan-500/20 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout & Lock Session</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-gray-950/95 border-b border-cyan-500/25 space-y-2 font-mono text-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left ${
                    link.isSpecialAction
                      ? 'bg-gradient-to-r from-cyan-950 via-purple-950 to-blue-950 border border-cyan-400/60 text-cyan-300 font-bold'
                      : 'bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="block font-bold">{link.name}</span>
                      <span className="text-[10px] text-slate-400">{link.subtitle}</span>
                    </div>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-400 text-black font-extrabold">
                      {link.badge}
                    </span>
                  )}
                  {link.protected && !isAuthenticated && !link.badge && (
                    <Lock className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              );
            })}

            {!isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Interactive Tabs Guide Modal for Common People */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl bg-gray-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    What is each tab or page created for?
                  </h3>
                  <p className="text-xs text-slate-400">
                    A simple guide for all students, innovators, and visitors on ProjectXia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs max-h-[65vh] overflow-y-auto pr-1">
              {navLinks.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {item.subtitle}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed pl-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs cursor-pointer"
              >
                Got It • Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Interactive Custom Software Request Modal */}
      <CustomSoftwareRequestModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onInquirySubmitted={() => {
          navigate('/profile?tab=software_requests');
        }}
      />
    </>
  );
};

export default Navbar;
