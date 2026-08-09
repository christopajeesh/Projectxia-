import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Code,
  Sparkles,
  MessageSquare,
  UploadCloud,
  LayoutDashboard,
  UserCheck,
  LogOut,
  Volume2,
  VolumeX,
  Menu,
  X,
  Lock,
  ChevronDown,
  Terminal,
  Activity,
  LogIn,
  UserPlus,
  ShoppingBag,
  Lightbulb,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useSocket } from '../../context/SocketContext';
import { useCart } from '../../context/CartContext';
import CustomSoftwareRequestModal from './CustomSoftwareRequestModal';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { isMuted, toggleMute, playClick, playHover } = useSound();
  const { isConnected } = useSocket();
  const { cartCount, openCart } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const navLinks = [
    { name: 'Projects', path: '/marketplace', icon: Code, protected: false },
    { name: 'Plagiarism Check', path: '/ai-shield', icon: Shield, protected: true },
    {
      name: 'Build Software / Share Idea',
      isSpecialAction: true,
      icon: Lightbulb,
      highlight: true,
      protected: true,
      badge: 'TEAM',
    },
    { name: 'Messages & Chats', path: '/chat', icon: MessageSquare, protected: true },
    { name: 'Sell Project', path: '/upload', icon: UploadCloud, protected: true },
    { name: 'Profile', path: '/profile', icon: UserCheck, protected: true },
  ];

  const handleNavClick = (link, e) => {
    e.preventDefault();
    playClick();
    setMobileMenuOpen(false);

    if (link.isSpecialAction) {
      if (!isAuthenticated) {
        openAuthModal(
          'login',
          'Please log in or register to share your software idea or request an instant callback from the ProjectXia Developing Team.'
        );
      } else {
        setIsCustomModalOpen(true);
      }
      return;
    }

    if (link.protected && !isAuthenticated) {
      openAuthModal('login', `Please log in or register to access ${link.name}.`);
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
      <header className="sticky top-0 z-40 w-full border-b border-cyan-500/25 bg-black/85 backdrop-blur-2xl shadow-xl shadow-cyan-950/20">
        {/* Top Minimal Cyber Status Bar */}
        <div className="hidden sm:flex items-center justify-between px-4 sm:px-8 py-1 bg-gradient-to-r from-gray-950 via-cyan-950/40 to-gray-950 border-b border-cyan-500/10 text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>SYSTEM: ONLINE</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">ALL DEPARTMENTS HARDWARE & SOFTWARE MARKETPLACE</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>REAL-TIME GATEWAY: {isConnected ? 'CONNECTED' : 'STANDBY'}</span>
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* BRAND LOGO */}
            <Link
              to="/"
              onClick={playClick}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 border border-cyan-400 shadow-neon-cyan group-hover:scale-105 transition-all">
                <Shield className="w-5 h-5 text-black" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-cyan-300 animate-spin" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white">
                  PROJECT<span className="text-cyan-400">XIA</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.path && location.pathname === link.path;

                if (link.isSpecialAction) {
                  return (
                    <button
                      key={link.name}
                      onClick={(e) => handleNavClick(link, e)}
                      onMouseEnter={playHover}
                      className="relative px-3 py-1.5 rounded-xl font-display font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-cyan-950/90 via-purple-950/90 to-blue-950/90 border border-cyan-400/60 text-cyan-300 hover:text-white hover:border-cyan-300 shadow-lg shadow-cyan-500/20 hover:scale-105 group"
                    >
                      <Icon className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                      <span>{link.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-400 text-black font-extrabold uppercase tracking-wider">
                        {link.badge}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={link.name}
                    onClick={(e) => handleNavClick(link, e)}
                    onMouseEnter={playHover}
                    className={`relative px-2.5 lg:px-3 py-2 rounded-xl font-display font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-neon-cyan'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                    {link.protected && !isAuthenticated && (
                      <Lock className="w-2.5 h-2.5 text-slate-500 ml-0.5" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Cluster */}
            <div className="flex items-center gap-2.5">
              {/* Deals & Messages Direct Hub */}
              <Link
                to="/chat"
                onClick={playClick}
                title="Live Negotiations & Creator Deals"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 hover:text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20 text-xs font-mono font-bold"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Deals & Chat</span>
              </Link>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  toggleMute();
                }}
                title={isMuted ? 'Unmute Audio' : 'Mute Cyber Audio FX'}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* AUTH STATE: LOGIN/REGISTER (WHEN GUEST) vs PROFILE & DIRECT LOGOUT (WHEN LOGGED IN) */}
              {!isAuthenticated ? (
                /* Unauthenticated: Premium Login / Register Trigger */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal('login', 'Please log in or register to access verified projects.')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-display font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Login / Register</span>
                  </button>
                </div>
              ) : (
                /* Authenticated User: Profile Dropdown AND Direct Logout Button */
                <div className="flex items-center gap-2">
                  {/* Direct 1-Click Navbar Logout Button */}
                  <button
                    onClick={handleLogout}
                    title="Sign Out & Lock Session"
                    className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-display font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 shadow-md shadow-rose-950/30 cursor-pointer"
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
                      className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 transition-all cursor-pointer"
                    >
                      <img
                        src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'User')}&backgroundColor=080e1e,101f4e&textColor=00f0ff`}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover border border-cyan-400/40 bg-gray-900"
                      />
                      <div className="hidden lg:flex flex-col text-left pr-1">
                        <span className="text-xs font-semibold text-white leading-tight">
                          {user?.name?.split(' ')?.[0] || user?.name || user?.email?.split('@')?.[0] || 'Innovator'}
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400 uppercase">{user?.role || 'user'}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-gray-950/95 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-2xl py-2 z-50">
                        <div className="px-4 py-2 border-b border-cyan-500/20">
                          <p className="text-xs font-bold text-white">{user?.name || user?.email?.split('@')?.[0] || 'Innovator'}</p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300"
                        >
                          My Profile & Projects
                        </Link>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsCustomModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-cyan-300 font-bold bg-cyan-950/40 hover:bg-cyan-900/60 border-y border-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>💡 Build Software with ProjectXia Team</span>
                        </button>

                        {/* Exclusive Admin HUD for theprojectxia@gmail.com */}
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
                          className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 border-t border-cyan-500/20 cursor-pointer"
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl ${
                    link.isSpecialAction
                      ? 'bg-gradient-to-r from-cyan-950 via-purple-950 to-blue-950 border border-cyan-400/60 text-cyan-300 font-bold'
                      : 'bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{link.name}</span>
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
