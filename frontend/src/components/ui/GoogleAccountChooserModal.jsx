import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Shield, ArrowRight, CheckCircle2, RefreshCw, KeyRound, Lock } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

const GoogleAccountChooserModal = ({ isOpen, onClose, onSelectAccount }) => {
  const { playClick, playSuccess } = useSound();
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState(1); // 1: Choose Account, 2: 2FA Email Verification
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [googleOtp, setGoogleOtp] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Chrispin Pajeesh',
      email: 'christopajeesh@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Chrispin%20Pajeesh&backgroundColor=1a73e8&textColor=ffffff',
    },
    {
      name: 'Chrispin Pajeesh (Alt)',
      email: 'chrispinpajeesh@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Chrispin&backgroundColor=34a853&textColor=ffffff',
    },
  ];

  // Step 1: Select Account & Dispatch Real Gmail Security Code
  const handleAccountClick = async (account) => {
    setErrorMsg('');
    setLoading(true);
    playClick();

    setSelectedAccount(account);
    const res = await sendOtp(account.email);
    setLoading(false);

    if (res.success) {
      playSuccess();
      setStatusMsg(`Security verification code dispatched to ${account.email}. Please check your inbox.`);
      setStep(2);
    } else {
      setErrorMsg(res.message || 'Failed to dispatch Google security code. Please try again.');
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;

    const email = customEmail.trim().toLowerCase();
    const name = customName.trim() || email.split('@')[0];

    handleAccountClick({
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a73e8&textColor=ffffff`,
    });
  };

  // Step 2: Verify Gmail 2FA Code and Authenticate in Atlas
  const handleVerifyGoogleCode = async (e) => {
    e.preventDefault();
    if (!googleOtp || googleOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit code sent to your Gmail.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    playClick();

    const res = await verifyOtp({
      identifier: selectedAccount.email,
      otp: googleOtp.trim(),
      name: selectedAccount.name,
      authProvider: 'google',
    });

    setLoading(false);

    if (res.success) {
      playSuccess();
      onSelectAccount(selectedAccount.email, selectedAccount.name, selectedAccount.avatar);
      onClose();
    } else {
      setErrorMsg(res.message || 'Invalid security code. Please check your Gmail inbox.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white text-gray-900 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 font-sans border border-slate-200"
        >
          {/* Header with official Google Logo */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="font-medium text-base text-gray-900 leading-tight">
                  Sign in with Google
                </h3>
                <p className="text-[11px] text-gray-500">to continue to ProjectXia</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Select Google Account */
            <div className="pt-3 pb-1">
              <p className="text-xs font-semibold text-gray-600 mb-2">Choose an account</p>

              <div className="space-y-1.5">
                {defaultAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleAccountClick(acc)}
                    className="w-full p-2.5 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all flex items-center justify-between text-left cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div className="truncate">
                        <p className="text-xs font-medium text-gray-900 group-hover:text-blue-600 truncate">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{acc.email}</p>
                      </div>
                    </div>
                    {loading && selectedAccount?.email === acc.email ? (
                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-transparent group-hover:text-blue-500 transition-colors" />
                    )}
                  </button>
                ))}

                {/* Use another account option */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    playClick();
                    setShowCustomInput(!showCustomInput);
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-gray-50 border border-dashed border-gray-200 transition-all flex items-center gap-3 text-left cursor-pointer disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Use another account</p>
                    <p className="text-[10px] text-gray-400">Sign in with a different Gmail</p>
                  </div>
                </button>
              </div>

              {/* Custom Google Account Input */}
              {showCustomInput && (
                <form onSubmit={handleCustomSubmit} className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                      Your Gmail / Google Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-0.5">
                      Your Name (Optional):
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Chrispin Pajeesh"
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Continue with this account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STEP 2: Live 2FA Google Security Verification */
            <form onSubmit={handleVerifyGoogleCode} className="pt-3 pb-1 space-y-3.5">
              <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-gray-500 block">Authenticating as:</span>
                  <span className="font-medium text-blue-700 truncate block">{selectedAccount?.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer shrink-0"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter 6-Digit Google Security Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={googleOtp}
                  onChange={(e) => setGoogleOtp(e.target.value)}
                  placeholder="Enter 6 digits"
                  className="w-full px-3 py-2.5 bg-gray-50 border-2 border-blue-400 focus:border-blue-600 rounded-xl text-center text-gray-900 text-lg tracking-[6px] font-mono font-bold focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Sent to your Gmail inbox via ProjectXia Google Security.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Dashboard →</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-600" />
              <span>Google 2-Factor Verified</span>
            </span>
            <span>English (United States)</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoogleAccountChooserModal;
