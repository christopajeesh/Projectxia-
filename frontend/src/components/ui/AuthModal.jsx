import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Mail,
  User,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Zap,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import AuroraBackground from './AuroraBackground';
import GoogleAccountChooserModal from './GoogleAccountChooserModal';
import confetti from 'canvas-confetti';

const departments = [
  'Computer Science (CSE / IT)',
  'AI & Data Science (AI / ML)',
  'Electronics & Comm (ECE)',
  'Electrical Engineering (EEE)',
  'Mechanical & Robotics',
  'Civil & Structural IoT',
  'Biomedical & Biotech',
  'Cyber Security',
];

const AuthModal = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authPromptReason,
    login,
    register,
    sendOtp,
    verifyOtp,
    firebaseGoogleSignIn,
  } = useAuth();
  const { playClick, playSuccess } = useSound();

  // Mode: 'signin' or 'register'
  const [authType, setAuthType] = useState('signin');
  // Verification Style: 'otp' (Fast 6-Digit Email Code) or 'password' (Email + Password)
  const [emailAuthMode, setEmailAuthMode] = useState('otp');

  // Input fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science (CSE / IT)');

  // Google Account Chooser popup state
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);

  // OTP Verification steps
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter Email, 2 = Enter & Verify OTP
  const [otpCode, setOtpCode] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Loaders & Alerts
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  // Sync mode when opened
  useEffect(() => {
    if (authModalMode === 'register') {
      setAuthType('register');
    } else {
      setAuthType('signin');
    }
    setOtpStep(1);
    setErrorMsg('');
    setStatusMsg('');
  }, [authModalMode, isAuthModalOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpStep === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  if (!isAuthModalOpen) return null;

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail or email address.');
      return;
    }

    if (authType === 'register' && !fullName.trim()) {
      setErrorMsg('Please enter your full name to create your account.');
      return;
    }

    setActiveEmail(cleanEmail);
    setLoading(true);
    playClick();

    const res = await sendOtp(cleanEmail);
    setLoading(false);

    if (res.success) {
      playSuccess();
      setDispatchedOtp(null);
      setOtpCode(''); // Empty for real user input from email
      setStatusMsg(`Verification code sent to ${cleanEmail}. Please check your inbox.`);
      setOtpStep(2);
      setCountdown(30);
      setCanResend(false);
    } else {
      setErrorMsg(res.message || 'Failed to dispatch verification code. Please try again.');
    }
  };

  // Step 2: Verify OTP and Redirect to Dashboard
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    playClick();

    const res = await verifyOtp({
      identifier: activeEmail,
      otp: otpCode,
      name: fullName.trim() || undefined,
      department: authType === 'register' ? department : undefined,
    });
    setLoading(false);

    if (res.success) {
      playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      closeAuthModal();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/marketplace');
    } else {
      setErrorMsg(res.message || 'Incorrect verification code. Please check the code.');
    }
  };

  // Direct Password Authentication and Redirect to Landing Page
  const handlePasswordAuth = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    playClick();

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    let res;
    if (authType === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your name.');
        setLoading(false);
        return;
      }
      res = await register({
        name: fullName.trim() || 'Innovator',
        email: cleanEmail,
        password: passwordInput || 'ProjectXia@2026',
        department,
      });
    } else {
      res = await login({
        email: cleanEmail,
        password: passwordInput,
      });
    }
    setLoading(false);

    if (res.success) {
      playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      closeAuthModal();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/marketplace');
    } else {
      setErrorMsg(res.message || 'Authentication failed. Use Email OTP for instant 1-click login.');
    }
  };

  // 1-Click Google Sign-In and Open Authentic Account Chooser
  const handleGoogleAuth = () => {
    setErrorMsg('');
    playClick();
    setIsGoogleChooserOpen(true);
  };

  const handleAccountChosen = async (chosenEmail, chosenName, chosenAvatar) => {
    setLoading(true);
    playClick();

    const res = await firebaseGoogleSignIn(chosenEmail, chosenName);
    setLoading(false);

    if (res.success) {
      playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      closeAuthModal();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/marketplace');
    } else {
      setErrorMsg(res.message || 'Google Sign-In was cancelled or failed.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto font-mono text-xs">
        {/* Dynamic 3D Backdrop - Translucent Glassmorphism so background video & 3D canvas shine through */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-md cursor-pointer overflow-hidden"
        >
          {/* Ambient 3D Aurora Light */}
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <AuroraBackground theme="cyan" />
          </div>
        </motion.div>

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#050b14]/95 backdrop-blur-2xl border-2 border-cyan-500/60 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/50 z-10 text-left max-h-[94vh] overflow-y-auto text-slate-100 ring-1 ring-cyan-400/40"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-cyan-500/30 bg-gradient-to-r from-gray-950/90 via-cyan-950/50 to-gray-950/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white">
                  PROJECT<span className="text-cyan-400">XIA</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {authType === 'signin' ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                closeAuthModal();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Optional Protected Route Banner */}
          {authPromptReason && (
            <div className="px-5 py-2.5 bg-cyan-950/50 border-b border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{authPromptReason}</span>
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            {/* Mode Switcher: Sign In vs Register */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-gray-900/90 border border-slate-800 text-xs font-display font-bold">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setAuthType('signin');
                  setOtpStep(1);
                  setErrorMsg('');
                  setStatusMsg('');
                }}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authType === 'signin'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setAuthType('register');
                  setOtpStep(1);
                  setErrorMsg('');
                  setStatusMsg('');
                }}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authType === 'register'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Prominent 1-Click Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-gray-900 font-display font-bold text-xs flex items-center justify-center gap-3 shadow-xl hover:shadow-cyan-500/20 transition-all cursor-pointer border border-white/20 active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google (1-Click)</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#050b14] px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Verification Sub-Mode: OTP Code vs Password */}
            <div className="flex items-center justify-between text-[11px] pb-1">
              <span className="text-slate-400 font-bold">Email Login Method:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setEmailAuthMode('otp');
                    setOtpStep(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    emailAuthMode === 'otp'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ Instant OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setEmailAuthMode('password');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    emailAuthMode === 'password'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔑 Password
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-shake">
                <span className="text-red-400 text-sm">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Status Message */}
            {statusMsg && (
              <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* FLOW A: EMAIL OTP AUTHENTICATION */}
            {emailAuthMode === 'otp' ? (
              otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Full Name for Registration */}
                  {authType === 'register' && (
                    <div>
                      <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                        Full Legal Name / Creator Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Chrispin Pajeesh"
                          className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Address */}
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      Email / Gmail Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  {/* Engineering Department for Registration */}
                  {authType === 'register' && (
                    <div>
                      <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                        Engineering Discipline
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none"
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: Enter & Verify OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-gray-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Verification Email:</span>
                      <span className="font-bold text-cyan-300">{activeEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setOtpStep(1);
                        setErrorMsg('');
                      }}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 text-[11px] font-bold">
                        Enter 6-Digit Code from Your Email
                      </label>
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6 digits"
                      className="w-full bg-gray-900/90 border-2 border-cyan-500/50 focus:border-cyan-400 rounded-xl px-3 py-3 text-center text-white text-xl tracking-[8px] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {countdown > 0 ? (
                        <>Resend code in <strong className="text-cyan-400">{countdown}s</strong></>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-cyan-400 hover:underline font-bold cursor-pointer"
                        >
                          Resend Code Now
                        </button>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">Zero-Trust Shield</span>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-600 hover:opacity-95 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Verify & Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )
            ) : (
              /* FLOW B: EMAIL + PASSWORD AUTHENTICATION */
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                {authType === 'register' && (
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      Full Legal Name / Creator Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Chrispin Pajeesh"
                        className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>{authType === 'register' ? 'Create Account & Enter Dashboard' : 'Sign In to Dashboard'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Owner Shortcut */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEmailInput('theprojectxia@gmail.com');
                  setFullName('ProjectXia Chief Architect');
                  playClick();
                }}
                className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Fill Owner Email (theprojectxia@gmail.com)</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Authentic Google Account Chooser Popup */}
        <GoogleAccountChooserModal
          isOpen={isGoogleChooserOpen}
          onClose={() => setIsGoogleChooserOpen(false)}
          onSelectAccount={handleAccountChosen}
        />
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
