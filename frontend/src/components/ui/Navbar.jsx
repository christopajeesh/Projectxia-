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
  Layers,
  ArrowRight,
  UserCheck,
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

  // Clear, Plain-English Navigation Tabs for Common People
  const navLinks = [
    {
      name: 'Browse Projects',
      subtitle: 'Buy Code & Videos',
      path: '/marketplace',
      icon: Code,
      accentColor: 'cyan',
      forWhom: 'For Students & Buyers',
      description: 'Explore authentic ready-to-run software, AI, and hardware projects with verified working demo videos and full downloadable source code.',
      protected: true,
    },
    {
      name: 'Plagiarism Check',
      subtitle: 'Scan Code & Thesis',
      path: '/ai-shield',
      icon: Shield,
      accentColor: 'purple',
      forWhom: 'For Academics & Researchers',
      description: 'Scan your code or IEEE project report against billions of sources to detect plagiarism, security flaws, and get an authenticity trust badge.',
      protected: true,
    },
    {
      name: 'Build Custom Software',
      subtitle: 'Hire Our Dev Team',
      isSpecialAction: true,
      icon: Lightbulb,
      accentColor: 'amber',
      badge: 'DEV TEAM',
      forWhom: 'For Custom Requirements',
      description: 'Need a custom app, thesis project, or AI tool built from scratch? Request the ProjectXia engineering team with a guaranteed 12-hour callback.',
      protected: false,
    },
    {
      name: 'Sell Your Project',
      subtitle: 'Earn Money from Code',
      path: '/upload',
      icon: UploadCloud,
      accentColor: 'emerald',
      isHighlight: true,
      badge: 'MONETIZE',
      forWhom: 'For Creators & Developers',
      description: 'Upload your original engineering project or code to start earning passive income every time someone purchases it.',
      protected: true,
    },
    {
      name: 'Creator Chat & Deals',
      subtitle: 'Talk & Negotiate',
      path: '/chat',
      icon: MessageSquare,
      accentColor: 'blue',
      forWhom: 'For 1-on-1 Discussions',
      description: 'Direct real-time private chat with project creators to ask technical questions, negotiate prices, or request custom features.',
      protected: true,
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
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-gray-950/90 backdrop-blur-2xl shadow-xl shadow-black/60">
        {/* Top Helper & Explainer Bar */}
        <div className="hidden sm:flex items-center justify-between px-4 sm:px-8 py-1.5 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 border-b border-cyan-500/15 text-[11px] font-sans">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
              <Activity className="w-3 h-3 animate-pulse text-cyan-400" />
              <span>PROJECTXIA LIVE HUB</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-300 font-medium">
              Verified Engineering Projects, In-House Custom Builds & AI Plagiarism Defense
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                playClick();
                setShowGuideModal(true);
              }}
              className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-100 transition-all cursor-pointer bg-cyan-950/70 hover:bg-cyan-900/80 px-2.5 py-0.5 rounded-lg border border-cyan-400/40 font-medium text-[11px] shadow-sm hover:scale-105"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>What is each tab for? (Tabs Guide)</span>
            </button>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>ENGINE ACTIVE</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            
            {/* BRAND LOGO */}
            <Link
              to="/"
              onClick={playClick}
              className="flex items-center gap-2.5 group cursor-pointer shrink-0"
              title="ProjectXia Home"
            >
              <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 border border-cyan-400 shadow-neon-cyan group-hover:scale-105 transition-all">
                <Shield className="w-5 h-5 text-black" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-cyan-200 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg sm:text-2xl tracking-tight text-white leading-none">
                  PROJECT<span className="text-cyan-400">XIA</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 hidden xs:block tracking-wider uppercase">
                  Engineering Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs (Clear Plain-English Titles & Sub-Explainers) */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {/* Tab 1: Buy Projects */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (!isAuthenticated) {
                    openAuthModal('login', 'Please log in or register to explore and download verified engineering projects.');
                  } else {
                    navigate('/marketplace');
                  }
                }}
                className={`group px-3 py-2 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2 border ${
                  location.pathname === '/marketplace'
                    ? 'bg-cyan-500/20 border-cyan-400/60 shadow-neon-cyan text-cyan-300'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90 hover:border-cyan-500/40 text-slate-200 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${location.pathname === '/marketplace' ? 'bg-cyan-400 text-black' : 'bg-cyan-950/60 text-cyan-400 group-hover:bg-cyan-500/20'}`}>
                  <Code className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-xs leading-tight">Buy Projects</span>
                  <span className="text-[10px] font-sans text-slate-400 group-hover:text-slate-300 leading-none">Code & 4K Videos</span>
                </div>
              </button>

              {/* Tab 2: Sell Your Project */}
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
                className={`group px-3 py-2 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2 border ${
                  location.pathname === '/upload'
                    ? 'bg-emerald-500/25 border-emerald-400/60 shadow-lg text-emerald-300'
                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-500/30 hover:border-emerald-400 text-slate-200 hover:text-white'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-emerald-400 text-black">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-display font-black text-xs text-emerald-300 leading-tight">Sell Project</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-400 text-black font-extrabold">
                      EARN
                    </span>
                  </div>
                  <span className="text-[10px] font-sans text-emerald-400/80 leading-none">Monetize Your Code</span>
                </div>
              </button>

              {/* Tab 3: Plagiarism Check */}
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
                className={`group px-3 py-2 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2 border ${
                  location.pathname === '/ai-shield'
                    ? 'bg-purple-500/20 border-purple-400/60 shadow-lg text-purple-300'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/90 hover:border-purple-500/40 text-slate-200 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${location.pathname === '/ai-shield' ? 'bg-purple-400 text-black' : 'bg-purple-950/60 text-purple-400 group-hover:bg-purple-500/20'}`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-extrabold text-xs leading-tight">Plagiarism Check</span>
                  <span className="text-[10px] font-sans text-slate-400 group-hover:text-slate-300 leading-none">Scan Code & Thesis</span>
                </div>
              </button>

              {/* Tab 4: Build Custom Software */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsCustomModalOpen(true);
                }}
                className="group px-3 py-2 rounded-xl transition-all cursor-pointer text-left flex items-center gap-2 bg-gradient-to-r from-purple-950/60 via-indigo-950/70 to-slate-900/80 border border-purple-500/40 hover:border-purple-400 shadow-md hover:scale-[1.02]"
              >
                <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                  <Lightbulb className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-display font-extrabold text-xs text-purple-200 group-hover:text-white leading-tight">Build Custom</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-gradient-to-r from-amber-400 to-purple-400 text-black font-extrabold">
                      DEV TEAM
                    </span>
                  </div>
                  <span className="text-[10px] font-sans text-slate-400 group-hover:text-slate-300 leading-none">Hire Our Engineers</span>
                </div>
              </button>
            </nav>

            {/* Right Action Cluster: Chat, Audio & Account */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Deals & Creator Chat */}
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
                title="Direct 1-on-1 Chat with Creators"
                className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer text-left ${
                  location.pathname === '/chat'
                    ? 'bg-blue-500/20 border-blue-400/60 text-blue-300'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 hover:border-blue-500/40 text-slate-200 hover:text-white'
                }`}
              >
                <div className="p-1 rounded-lg bg-blue-950 text-blue-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-xs leading-tight">Creator Chat</span>
                  <span className="text-[10px] text-slate-400 leading-none">Talk & Negotiate</span>
                </div>
              </button>

              {/* Sound Audio Toggle */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Cyber Audio FX'}
                className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* AUTH STATE: LOGIN/REGISTER vs PROFILE & LOGOUT */}
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    playClick();
                    openAuthModal('login', 'Please log in or register to access verified projects.');
                  }}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login / Register</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-display font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 shadow-md cursor-pointer"
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
                      className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-cyan-500/30 transition-all cursor-pointer"
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
                          className="block px-4 py-2.5 text-xs text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 font-medium"
                        >
                          👤 My Profile & Dashboard
                        </Link>

                        <Link
                          to="/profile?tab=software_requests"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2.5 text-xs text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 font-medium"
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
                          className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 border-t border-cyan-500/20 cursor-pointer font-bold"
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
                className="md:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 bg-gray-950/98 border-b border-cyan-500/25 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[11px] font-mono text-cyan-400 font-bold">NAVIGATION MENU</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowGuideModal(true);
                }}
                className="text-[10px] text-cyan-300 underline font-medium"
              >
                What do these tabs do?
              </button>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.name}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    link.isSpecialAction
                      ? 'bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-500/50 text-white'
                      : link.isHighlight
                      ? 'bg-emerald-950/50 border border-emerald-500/40 text-white'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-black/40 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-display font-extrabold text-sm text-white">{link.name}</span>
                      <span className="text-xs text-slate-400">{link.subtitle}</span>
                    </div>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-400 text-black font-extrabold">
                      {link.badge}
                    </span>
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-display font-bold text-xs flex items-center justify-center gap-2 mt-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
          <div className="relative w-full max-w-2xl bg-gray-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl text-white">
                    What is each tab or page for?
                  </h3>
                  <p className="text-xs text-slate-400">
                    A simple guide for students, buyers, developers, and visitors on ProjectXia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {navLinks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-display font-extrabold text-white text-sm block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-cyan-300 font-medium">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                      {item.forWhom}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed pl-1">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                Need help deciding? Click <strong>Build Custom</strong> to talk to our engineers.
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
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
