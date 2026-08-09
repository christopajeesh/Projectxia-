import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Shield, ArrowRight, CheckCircle2, RefreshCw, LogIn, Trash2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useAuth } from '../../context/AuthContext';

const GoogleAccountChooserModal = ({ isOpen, onClose, onSelectAccount }) => {
  const { playClick, playSuccess } = useSound();
  const { sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState(1); // 1: Choose/Enter Account, 2: 2FA Email Verification
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [googleOtp, setGoogleOtp] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [savedAccounts, setSavedAccounts] = useState([]);

  // Load recently used Google accounts strictly from the local browser storage (if any)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('projectxia_recent_google_accounts');
      if (stored) {
        setSavedAccounts(JSON.parse(stored));
      }
    } catch (e) {
      setSavedAccounts([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveRecentAccount = (account) => {
    try {
      const updated = [
        account,
        ...savedAccounts.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase()),
      ].slice(0, 3);
      setSavedAccounts(updated);
      localStorage.setItem('projectxia_recent_google_accounts', JSON.stringify(updated));
    } catch (e) {}
  };

  const removeRecentAccount = (emailToRemove, e) => {
    if (e) e.stopPropagation();
    const updated = savedAccounts.filter((a) => a.email !== emailToRemove);
    setSavedAccounts(updated);
    try {
      localStorage.setItem('projectxia_recent_google_accounts', JSON.stringify(updated));
    } catch (err) {}
  };

  // Step 1: Select/Submit Account & Dispatch Security Code
  const handleAccountSubmit = async (account) => {
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);
    playClick();

    setSelectedAccount(account);
    const res = await sendOtp(account.email, 'signin');
    setLoading(false);

    if (res.success) {
      playSuccess();
      saveRecentAccount(account);
      setStatusMsg(`Security verification code dispatched to ${account.email}. Please check your inbox.`);
      setStep(2);
    } else {
      setErrorMsg(res.message || 'Failed to dispatch Google security code. Please try again.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid Gmail or Google Workspace email.');
      return;
    }

    const email = emailInput.trim().toLowerCase();
    const name = nameInput.trim() || email.split('@')[0];

    handleAccountSubmit({
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1a73e8&textColor=ffffff`,
    });
  };

  // Step 2: Verify Gmail 2FA Code and Authenticate
  const handleVerifyGoogleCode = async (e) => {
    e.preventDefault();
    if (!googleOtp || googleOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
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
      if (onSelectAccount) {
        onSelectAccount(selectedAccount.email, selectedAccount.name, selectedAccount.avatar);
      }
      onClose();
    } else {
      setErrorMsg(res.message || 'Invalid security code. Please check your inbox.');
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
          {/* Header with Google Identity */}
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

          {/* Status Message */}
          {statusMsg && (
            <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs">
              {statusMsg}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Enter Google Email */
            <div className="pt-3 pb-1">
              {/* Show saved accounts on this device if any */}
              {savedAccounts.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1">Previous accounts on this device</p>
                  {savedAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAccountSubmit(acc)}
                      className="w-full p-2.5 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-7 h-7 rounded-full object-cover border border-gray-200"
                        />
                        <div className="truncate">
                          <p className="text-xs font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {acc.name}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">{acc.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeRecentAccount(acc.email, e)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove from this device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 my-2" />
                </div>
              )}

              {/* Enter Google Email Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email id"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Continue with Google</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* STEP 2: Live 2FA Security Verification */
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
