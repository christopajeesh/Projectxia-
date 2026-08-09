import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
} from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login', 'register', 'google', 'forgot'
  const [authPromptReason, setAuthPromptReason] = useState('');

  // Check stored credentials on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('projectxia_token');
    const storedUser = localStorage.getItem('projectxia_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('projectxia_token');
        localStorage.removeItem('projectxia_user');
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, []);

  const saveAuthSession = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem('projectxia_token', newToken);
      localStorage.setItem('projectxia_user', JSON.stringify(newUser));
    } catch (storageErr) {
      try {
        const { avatar, ...safeUser } = newUser || {};
        localStorage.setItem('projectxia_user', JSON.stringify(safeUser));
      } catch (e) {}
    }
  };

  // Firebase Email & Password Login
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // 1. Try Firebase Auth client if configured
      try {
        if (auth && auth.app) {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (fbErr) {
        // Fallback directly to ProjectXia Engine
      }

      // 2. Authenticate against ProjectXia Backend Engine
      const res = await api.post('/auth/login', { email, password });
      saveAuthSession(res.data.token, res.data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        notRegistered: err.response?.data?.notRegistered || err.response?.status === 404 || false,
        statusCode: err.response?.status,
        message: err.response?.data?.message || 'Login failed. Please verify credentials.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email & Password Registration
  const register = async (userData) => {
    setIsLoading(true);
    try {
      // 1. Try Firebase user creation
      try {
        if (auth && auth.app) {
          await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        }
      } catch (fbErr) {
        // Fallback to ProjectXia Engine
      }

      // 2. Register in ProjectXia Backend Engine
      const res = await api.post('/auth/register', userData);
      saveAuthSession(res.data.token, res.data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      return {
        success: false,
        alreadyRegistered: err.response?.status === 409 || err.response?.data?.alreadyRegistered || false,
        statusCode: err.response?.status,
        message: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google Sign-In with Universal Resilience
  const firebaseGoogleSignIn = async (userEmail, userName) => {
    setIsLoading(true);
    try {
      let googleData = null;

      // 1. Try Native Firebase Google Auth Popup
      try {
        if (auth) {
          const result = await signInWithPopup(auth, googleProvider);
          if (result?.user) {
            const idToken = await result.user.getIdToken(true);
            googleData = {
              idToken,
              email: result.user.email,
              name: result.user.displayName || userName || 'Google Innovator',
              avatar: result.user.photoURL || undefined,
            };
          }
        }
      } catch (fbErr) {
        console.warn('[Google Auth Provider Notice]:', fbErr.message);
      }

      // 2. If user selected account via Google Popup
      if (googleData?.email) {
        const res = await api.post('/auth/google', googleData);
        saveAuthSession(res.data.token, res.data.user);
        setIsAuthModalOpen(false);
        return { success: true, user: res.data.user };
      }

      // 3. If direct email was provided by client in input box
      const targetEmail = userEmail ? userEmail.trim().toLowerCase() : '';
      if (targetEmail && targetEmail.includes('@')) {
        const res = await api.post('/auth/google', {
          email: targetEmail,
          name: userName ? userName.trim() : targetEmail.split('@')[0],
          authProvider: 'google',
        });
        saveAuthSession(res.data.token, res.data.user);
        setIsAuthModalOpen(false);
        return { success: true, user: res.data.user };
      }

      // 4. Prompt user to choose their account
      return {
        success: false,
        message: 'Please select your Google account in the popup or enter your email address.',
      };
    } catch (err) {
      console.error('[Google Sign-In Error]:', err);
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Google Sign-In failed.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In Alias
  const googleSignIn = async (email, name) => {
    return await firebaseGoogleSignIn(email, name);
  };

  // Sign out and clear all sessions
  const logout = async () => {
    const currentUser = user;
    try {
      if (auth && auth.app) {
        await firebaseSignOut(auth);
      }
    } catch (e) {}

    setUser(null);
    setToken(null);
    localStorage.removeItem('projectxia_token');
    localStorage.removeItem('projectxia_user');
    sessionStorage.clear();

    // Log secret logout activity
    if (currentUser?.email) {
      api.post('/auth/logout-activity', { email: currentUser.email, name: currentUser.name }).catch(() => {});
    }
  };

  const openAuthModal = (mode = 'login', reason = '') => {
    setAuthModalMode(mode);
    setAuthPromptReason(reason);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason('');
  };

  // Password Recovery via Firebase Cloud Email Service + Backend Verification
  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      let firebaseSent = false;
      try {
        if (auth) {
          await sendPasswordResetEmail(auth, email);
          firebaseSent = true;
        }
      } catch (fbErr) {
        console.warn('[Firebase Cloud Email Notice]:', fbErr.message);
      }

      const res = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: firebaseSent
          ? 'Password reset link sent directly to your email inbox by Firebase.'
          : (res.data.message || 'Password reset code generated.'),
        otp: res.data.otp,
      };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password recovery failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password with OTP
  const resetPassword = async (email, newPassword, otp) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword, otp });
      saveAuthSession(res.data.token, res.data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Auto-Register and Sign In
  const quickRegisterLogin = async (email, password, name) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/quick-register-login', { email, password, name });
      saveAuthSession(res.data.token, res.data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Authentication failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP to phone/email
  const sendOtp = async (identifier, mode = 'signin') => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { identifier, mode });
      return { success: true, message: res.data.message, otp: res.data.otp };
    } catch (err) {
      return {
        success: false,
        notRegistered: err.response?.data?.notRegistered || err.response?.status === 404 || false,
        alreadyRegistered: err.response?.data?.alreadyRegistered || err.response?.status === 409 || false,
        statusCode: err.response?.status,
        message: err.response?.data?.message || 'Failed to send OTP code.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and complete sign-in / registration
  const verifyOtp = async (otpData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', otpData);
      saveAuthSession(res.data.token, res.data.user);
      setIsAuthModalOpen(false);
      return { success: true, user: res.data.user, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'OTP verification failed.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to enforce auth with custom prompt reason
  const requireAuth = (reason = 'Please log in or register to continue.', mode = 'login') => {
    if (!user) {
      openAuthModal(mode, reason);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isOwner: user?.email?.toLowerCase() === 'theprojectxia@gmail.com',
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authPromptReason,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
        requireAuth,
        login,
        register,
        googleSignIn,
        firebaseGoogleSignIn,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        quickRegisterLogin,
        updateUserData: (updatedUser) => {
          setUser(updatedUser);
          try {
            localStorage.setItem('projectxia_user', JSON.stringify(updatedUser));
          } catch (storageErr) {
            try {
              const { avatar, ...safeUser } = updatedUser || {};
              localStorage.setItem('projectxia_user', JSON.stringify(safeUser));
            } catch (e) {}
          }
        },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
