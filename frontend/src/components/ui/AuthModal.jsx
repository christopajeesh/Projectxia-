import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import AuroraBackground from './AuroraBackground';
import confetti from 'canvas-confetti';

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
    case 4:
      return { score: 4, label: 'Cyber-Secure', color: 'bg-emerald-500', text: 'text-emerald-400' };
    default:
      return { score: 0, label: '', color: 'bg-slate-700', text: 'text-slate-500' };
  }
};

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
    forgotPassword,
    resetPassword,
    firebaseGoogleSignIn,
  } = useAuth();
  const { playClick, playSuccess } = useSound();

  // Mode: 'signin' | 'register' | 'forgot'
  const [authType, setAuthType] = useState('signin');
  // Verification Style for standard signin/register: 'password' | 'otp'
  const [emailAuthMode, setEmailAuthMode] = useState('password');

  // Input fields
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password sub-step: 1 = Enter Email ID, 2 = Enter OTP + New Password + Confirm Password
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Unregistered Account Popup Modal State
  const [showNotRegisteredPopup, setShowNotRegisteredPopup] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState('');

  // Already Registered Account Popup Modal State
  const [showAlreadyRegisteredPopup, setShowAlreadyRegisteredPopup] = useState(false);

  // OTP Verification steps (for Instant OTP sign-in / registration)
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter Email ID, 2 = Enter & Verify OTP
  const [otpCode, setOtpCode] = useState('');
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
    } else if (authModalMode === 'forgot') {
      setAuthType('forgot');
      setForgotStep(1);
    } else {
      setAuthType('signin');
    }
    setOtpStep(1);
    setErrorMsg('');
    setStatusMsg('');
    setShowNotRegisteredPopup(false);
    setShowAlreadyRegisteredPopup(false);
  }, [authModalMode, isAuthModalOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if ((otpStep === 2 || (authType === 'forgot' && forgotStep === 2)) && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpStep, forgotStep, authType, countdown]);

  if (!isAuthModalOpen) return null;

  const passwordStrength = getPasswordStrength(authType === 'forgot' ? forgotNewPassword : passwordInput);

  // ============================================================
  // FLOW 1: SEND OTP (Instant Code Sign-In / Register)
  // ============================================================
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email id.');
      return;
    }

    setActiveEmail(cleanEmail);
    setLoading(true);
    playClick();

    const res = await sendOtp(cleanEmail, authType);
    setLoading(false);

    if (res.success) {
      playSuccess();
      setOtpCode('');
      setStatusMsg(`Verification code sent to ${cleanEmail}. Please check your inbox.`);
      setOtpStep(2);
      setCountdown(30);
      setCanResend(false);
    } else {
      if (res.notRegistered || res.statusCode === 404) {
        setUnregisteredEmail(cleanEmail);
        setShowNotRegisteredPopup(true);
      } else if (res.alreadyRegistered || res.statusCode === 409) {
        setShowAlreadyRegisteredPopup(true);
      } else {
        setErrorMsg(res.message || 'Failed to dispatch verification code. Please try again.');
      }
    }
  };

  // ============================================================
  // FLOW 2: VERIFY OTP (Instant Code Complete)
  // ============================================================
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    playClick();

    const res = await verifyOtp({
      identifier: activeEmail,
      otp: otpCode,
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

  // ============================================================
  // FLOW 3: EMAIL + PASSWORD AUTHENTICATION (With Confirm Password)
  // ============================================================
  const handlePasswordAuth = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email id.');
      return;
    }

    if (!passwordInput) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (authType === 'register') {
      if (passwordInput.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setErrorMsg('Passwords do not match. Please verify your confirm password.');
        return;
      }
    }

    setLoading(true);
    playClick();

    let res;
    if (authType === 'register') {
      res = await register({
        email: cleanEmail,
        password: passwordInput,
      });
    } else {
      res = await login(cleanEmail, passwordInput);
    }
    setLoading(false);

    if (res.success) {
      playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      closeAuthModal();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/marketplace');
    } else {
      if (res.noPasswordSet) {
        setErrorMsg(res.message || 'This account does not have a password yet.');
        setStatusMsg('💡 You can click "Forgot Password?" above to set a password for this email, or switch to Instant OTP Code.');
      } else if (res.notRegistered || res.statusCode === 404) {
        setUnregisteredEmail(cleanEmail);
        setShowNotRegisteredPopup(true);
      } else if (res.alreadyRegistered || res.statusCode === 409) {
        setShowAlreadyRegisteredPopup(true);
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please verify credentials.');
      }
    }
  };

  // ============================================================
  // FLOW 4: FORGOT & RESET PASSWORD FLOW
  // ============================================================
  const handleSendResetOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter your registered email id.');
      return;
    }

    setLoading(true);
    playClick();

    const res = await forgotPassword(cleanEmail);
    setLoading(false);

    if (res.success) {
      playSuccess();
      setForgotStep(2);
      setStatusMsg(res.message || `Password reset code sent to ${cleanEmail}. Please check your inbox.`);
      setCountdown(30);
      setCanResend(false);
    } else {
      setErrorMsg(res.message || 'Unable to send password recovery code. Please check your email id.');
    }
  };

  const handleCompletePasswordReset = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!forgotOtp || forgotOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit recovery code from your email.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMsg('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    playClick();

    const res = await resetPassword(cleanEmail, forgotNewPassword, forgotOtp.trim());
    setLoading(false);

    if (res.success) {
      playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      closeAuthModal();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      navigate('/marketplace');
    } else {
      setErrorMsg(res.message || 'Password reset failed. Invalid or expired OTP.');
    }
  };

  // ============================================================
  // FLOW 5: GOOGLE AUTHENTICATION (Direct Native Device Account Access)
  // ============================================================
  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);
    playClick();

    try {
      const cleanEmail = emailInput ? emailInput.trim().toLowerCase() : '';
      const res = await firebaseGoogleSignIn(cleanEmail);
      setLoading(false);

      if (res.success) {
        playSuccess();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        closeAuthModal();
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        navigate('/marketplace');
      } else {
        if (res.needEmailPrompt) {
          setStatusMsg('Please enter your Google Email ID in the box below and tap Continue with Google.');
        } else {
          setErrorMsg(res.message || 'Google Sign-In failed. Please try again.');
        }
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Google Sign-In could not access device account.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto font-sans text-xs">
        {/* Dynamic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <AuroraBackground theme="cyan" />
          </div>
        </motion.div>

        {/* Main Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#050b14]/95 backdrop-blur-2xl border-2 border-cyan-500/60 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/50 z-10 text-left max-h-[94vh] overflow-y-auto text-slate-100 ring-1 ring-cyan-400/40 font-sans"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-cyan-500/30 bg-gradient-to-r from-gray-950/90 via-cyan-950/50 to-gray-950/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
                {authType === 'forgot' ? (
                  <KeyRound className="w-5 h-5 text-cyan-300 animate-pulse" />
                ) : (
                  <Shield className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white tracking-wide">
                  PROJECT<span className="text-cyan-400">XIA</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {authType === 'signin' && 'Sign in to your account'}
                  {authType === 'register' && 'Create your account'}
                  {authType === 'forgot' && 'Password recovery'}
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
          {authPromptReason && authType !== 'forgot' && (
            <div className="px-5 py-2.5 bg-cyan-950/50 border-b border-cyan-500/20 text-[11px] text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{authPromptReason}</span>
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            {/* Top Mode Tabs (Sign In vs Create Account) */}
            {authType !== 'forgot' ? (
              <>
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

                {/* Real Device Google Sign-In */}
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
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-[#050b14] px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    or continue with email
                  </span>
                  <div className="border-t border-slate-800 w-full" />
                </div>

                {/* Email Method: Password vs OTP */}
                <div className="flex items-center justify-between text-[11px] pb-1">
                  <span className="text-slate-400 font-bold">Email Method:</span>
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              </>
            ) : (
              /* Forgot Password Back Button Header */
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setAuthType('signin');
                    setErrorMsg('');
                    setStatusMsg('');
                  }}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Step {forgotStep} of 2
                </span>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Status Message Alert */}
            {statusMsg && (
              <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* ======================================================= */}
            {/* VIEW A: FORGOT PASSWORD FLOW */}
            {/* ======================================================= */}
            {authType === 'forgot' ? (
              forgotStep === 1 ? (
                /* Forgot Step 1: Enter Email ID */
                <form onSubmit={handleSendResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      Email ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Enter your email id"
                        className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <>
                        <span>Send Password Reset Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Forgot Step 2: Enter OTP + New Password + Confirm Password */
                <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                  <div className="p-3 bg-gray-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Reset Code Sent To:</span>
                      <span className="font-bold text-cyan-300">{emailInput}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setForgotStep(1);
                        setErrorMsg('');
                      }}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  {/* 6-Digit OTP */}
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      Enter 6-Digit Code from Email
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoComplete="one-time-code"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="Enter 6 digits"
                      className="w-full bg-gray-900/90 border-2 border-cyan-500/50 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-center text-white text-lg tracking-[6px] font-mono font-bold focus:outline-none"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type={showForgotNewPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-10 py-2.5 text-white text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Re-enter New Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 text-[11px] font-bold">
                        Re-enter New Password <span className="text-cyan-400 font-normal">(for assurance)</span>
                      </label>
                      {forgotConfirmPassword && (
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${
                          forgotNewPassword === forgotConfirmPassword ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {forgotNewPassword === forgotConfirmPassword ? (
                            <>✓ Passwords match</>
                          ) : (
                            <>✕ Passwords do not match</>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password for assurance"
                        className={`w-full bg-gray-900/90 border rounded-xl pl-9 pr-10 py-2.5 text-white text-xs focus:outline-none ${
                          forgotConfirmPassword
                            ? forgotNewPassword === forgotConfirmPassword
                              ? 'border-emerald-500/70 focus:border-emerald-400'
                              : 'border-red-500/70 focus:border-red-400'
                            : 'border-slate-800 focus:border-cyan-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Countdown & Resend */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {countdown > 0 ? (
                        <>Resend code in <strong className="text-cyan-400">{countdown}s</strong></>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendResetOtp}
                          className="text-cyan-400 hover:underline font-bold cursor-pointer"
                        >
                          Resend Code Now
                        </button>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">Zero-Trust Shield</span>
                  </div>

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
                        <span>Reset Password & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )
            ) : emailAuthMode === 'password' ? (
              /* ======================================================= */
              /* VIEW B: EMAIL + PASSWORD AUTHENTICATION (With Confirm)  */
              /* ======================================================= */
              <form onSubmit={handlePasswordAuth} className="space-y-4">
                {/* Email ID */}
                <div>
                  <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                    Email ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter your email id"
                      className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 text-[11px] font-bold">
                      Password
                    </label>
                    {authType === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          setAuthType('forgot');
                          setForgotStep(1);
                          setErrorMsg('');
                          setStatusMsg('');
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer font-bold"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={authType === 'register' ? 'new-password' : 'current-password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-10 py-2.5 text-white text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (in register mode) */}
                  {authType === 'register' && passwordInput && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-[10px] font-mono font-bold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Re-enter Password Field (Only for Registration) */}
                {authType === 'register' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 text-[11px] font-bold">
                        Re-enter Password <span className="text-cyan-400 font-normal">(for assurance)</span>
                      </label>
                      {confirmPasswordInput && (
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${
                          passwordInput === confirmPasswordInput ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {passwordInput === confirmPasswordInput ? (
                            <>✓ Passwords match</>
                          ) : (
                            <>✕ Passwords do not match</>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-enter password for assurance"
                        className={`w-full bg-gray-900/90 border rounded-xl pl-9 pr-10 py-2.5 text-white text-xs focus:outline-none ${
                          confirmPasswordInput
                            ? passwordInput === confirmPasswordInput
                              ? 'border-emerald-500/70 focus:border-emerald-400'
                              : 'border-red-500/70 focus:border-red-400'
                            : 'border-slate-800 focus:border-cyan-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
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
            ) : (
              /* ======================================================= */
              /* VIEW C: INSTANT OTP CODE FLOW                           */
              /* ======================================================= */
              otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Email ID */}
                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      Email ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Enter your email id"
                        className="w-full bg-gray-900/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

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
                        <span>{authType === 'signin' ? 'Send Sign-In Code' : 'Send Verification Code'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP */
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
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-[11px] mb-1 font-bold">
                      Enter 6-Digit Code from Your Email
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoComplete="one-time-code"
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
            )}
          </div>
        </motion.div>

        {/* ======================================================= */}
        {/* POPUP 1: Account Not Registered Alert Modal             */}
        {/* ======================================================= */}
        <AnimatePresence>
          {showNotRegisteredPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotRegisteredPopup(false)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#08101e] border-2 border-amber-500/70 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/30 z-10 text-left text-white ring-2 ring-amber-400/30 font-sans"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 shrink-0">
                      <UserPlus className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                        New User Detected
                      </span>
                      <h3 className="text-lg font-display font-black text-white mt-1">
                        Account Not Registered
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotRegisteredPopup(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Explanation Box */}
                <div className="p-4 rounded-2xl bg-gray-950/90 border border-amber-500/30 mb-5 space-y-2.5">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    No ProjectXia account was found for{' '}
                    <strong className="text-amber-300 font-mono underline break-all">
                      {unregisteredEmail || emailInput}
                    </strong>.
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    You need to create an account before you can log in. Create your free account in seconds to access verified blueprints and engineering tools.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowNotRegisteredPopup(false);
                      setAuthType('register');
                      setEmailInput(unregisteredEmail || emailInput);
                      setOtpStep(1);
                      setErrorMsg('');
                      setStatusMsg('Welcome! Enter password to complete registration.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:opacity-95 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <UserPlus className="w-4 h-4 text-black" />
                    <span>Create Account Now (Free)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowNotRegisteredPopup(false);
                      setErrorMsg('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs transition-colors cursor-pointer text-center"
                  >
                    Try another email id
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================= */}
        {/* POPUP 2: Account Already Registered Alert Modal         */}
        {/* ======================================================= */}
        <AnimatePresence>
          {showAlreadyRegisteredPopup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAlreadyRegisteredPopup(false)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-[#08101e] border-2 border-cyan-500/70 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-cyan-500/30 z-10 text-left text-white ring-2 ring-cyan-400/30 font-sans"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shrink-0">
                      <LogIn className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                        Existing Profile
                      </span>
                      <h3 className="text-lg font-display font-black text-white mt-1">
                        Account Already Exists
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAlreadyRegisteredPopup(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-gray-950/90 border border-cyan-500/30 mb-5 space-y-2">
                  <p className="text-xs text-slate-200 leading-relaxed">
                    An account already exists for{' '}
                    <strong className="text-cyan-300 font-mono underline break-all">
                      {emailInput}
                    </strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    You can sign in directly using your password or 1-click Instant Email OTP.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowAlreadyRegisteredPopup(false);
                      setAuthType('signin');
                      setOtpStep(1);
                      setErrorMsg('');
                      setStatusMsg('Switched to Sign In mode.');
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-black font-display font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <LogIn className="w-4 h-4 text-black" />
                    <span>Switch to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowAlreadyRegisteredPopup(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs transition-colors cursor-pointer text-center"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
