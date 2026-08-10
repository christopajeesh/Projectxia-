import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import admin from 'firebase-admin';
import fs from 'fs';

import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import {
  sendOtpEmail,
  sendPasswordResetEmail,
  sendAuthAlertEmail,
} from '../services/emailService.js';

const OWNER_EMAIL = 'theprojectxia@gmail.com';

// ============================================================
// JWT
// ============================================================

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'projectxia_super_secret_jwt_key_2026';
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: String(user._id || user.id),
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: '7d',
    }
  );
};

// ============================================================
// HELPERS
// ============================================================

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

const getRole = (email, requestedRole = 'user') => {
  const normalized = normalizeEmail(email);
  if (normalized === OWNER_EMAIL) {
    return 'owner';
  }
  if (requestedRole === 'creator') {
    return 'creator';
  }
  return 'user';
};

const userResponse = (user) => ({
  id: user._id || user.id,
  _id: user._id || user.id,
  name: user.name,
  email: user.email,
  mobile: user.mobile || '',
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  skills: user.skills,
  education: user.education,
  experience: user.experience,
  github: user.github,
  linkedin: user.linkedin,
  portfolio: user.portfolio,
  isVerified: user.isVerified,
  verificationLevel: user.verificationLevel,
  isBanned: user.isBanned,
  authProvider: user.authProvider,
  reputationScore: user.reputationScore,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ============================================================
// AUDIT LOG
// ============================================================

const createAudit = async ({
  req,
  user,
  action,
  details = {},
  threatLevel = 'CLEAN',
}) => {
  try {
    const performedBy = user
      ? {
          id: String(user._id || user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : undefined;

    const targetEntity = user
      ? {
          entityType: 'USER',
          entityId: String(user._id || user.id),
          title: `${user.name} (${user.email})`,
        }
      : undefined;

    await AuditLog.create({
      action,
      category: 'AUTH_EVENT',
      performedBy,
      targetEntity,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Mozilla/5.0 (ProjectXia Verified Client)',
      threatLevel,
      details,
    });
  } catch (error) {
    console.warn('[ProjectXia Audit Log Note]:', error.message);
  }
};

const notifyOwnerOfAuthEvent = async ({ action, user, method, req }) => {
  try {
    const ip = req ? getClientIp(req) : '127.0.0.1';
    const userAgent = req?.headers ? req.headers['user-agent'] || 'Unknown Device' : 'Web Client';
    await sendAuthAlertEmail({
      action,
      user,
      method,
      ip,
      userAgent,
    });
  } catch (err) {
    console.warn('[ProjectXia Owner Notification Warning]:', err.message);
  }
};

// ============================================================
// OTP STORE
// ============================================================

const otpStore = new Map();

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const saveOtp = (identifier) => {
  const otp = generateOtp();
  otpStore.set(identifier, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });
  return otp;
};

// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ID and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const userName = (name && name.trim()) || normalizedEmail.split('@')[0];

    const user = await User.create({
      name: userName,
      email: normalizedEmail,
      mobile: mobile || '',
      password,
      role: getRole(normalizedEmail, role),
      authProvider: 'local',
      isVerified: false,
      verificationLevel: 'Unverified',
      isBanned: false,
    });

    await createAudit({
      req,
      user,
      action: 'USER_REGISTERED',
      details: {
        authenticationMethod: 'EMAIL_PASSWORD',
        registeredAt: new Date(),
      },
    });

    // Notify theprojectxia@gmail.com
    notifyOwnerOfAuthEvent({
      action: 'New User Registered',
      user,
      method: 'Email ID + Password',
      req,
    }).catch(() => {});

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed: ' + error.message,
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: `No account found with this email (${normalizedEmail}). Please register first.`,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'This account has been quarantined by Anti-Fraud Shield.',
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        noPasswordSet: true,
        message: 'This account does not have a password yet (registered via Google or OTP). You can sign in using Instant OTP Code or click "Forgot Password?" to create a password.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      await createAudit({
        req,
        user,
        action: 'LOGIN_FAILED',
        threatLevel: 'LOW',
        details: {
          reason: 'INVALID_PASSWORD',
          attemptedEmail: normalizedEmail,
        },
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please try again or use Instant OTP verification.',
      });
    }

    await createAudit({
      req,
      user,
      action: 'USER_LOGGED_IN',
      details: {
        authenticationMethod: 'EMAIL_PASSWORD',
        loginTime: new Date(),
      },
    });

    notifyOwnerOfAuthEvent({
      action: 'User Logged In',
      user,
      method: 'Email ID + Password',
      req,
    }).catch(() => {});

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

// ============================================================
// SEND OTP (UNIVERSAL DISPATCH FOR EMAIL & MOBILE)
// ============================================================

export const sendOtp = async (req, res) => {
  try {
    const { identifier, email, mobile, name } = req.body;
    const rawIdentifier = identifier || email || mobile;

    if (!rawIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address or mobile number.',
      });
    }

    const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
    const cleanPhone = cleanIdentifier.replace(/\s/g, '');
    const isPhone = /^\+?[1-9]\d{7,14}$/.test(cleanPhone);

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email or international phone number.',
      });
    }

    // ========================================================
    // EMAIL OTP
    // ========================================================
    if (isEmail) {
      const otp = saveOtp(cleanIdentifier);

      console.log('\n======================================================');
      console.log(`🔑 [PROJECTXIA VERIFICATION OTP] Code for ${cleanIdentifier}: ${otp}`);
      console.log('======================================================\n');

      let emailDelivered = false;
      try {
        const emailResult = await sendOtpEmail({
          to: cleanIdentifier,
          otp,
          name: name || cleanIdentifier.split('@')[0],
        });
        emailDelivered = emailResult.success;
      } catch (err) {
        console.warn('[ProjectXia OTP Mail Notice]:', err.message);
      }

      // Notify owner of authentication activity
      notifyOwnerOfAuthEvent({
        action: 'OTP_REQUESTED',
        user: { email: cleanIdentifier, name: name || cleanIdentifier.split('@')[0] },
        method: 'EMAIL_OTP',
        req,
      }).catch(() => {});

      return res.json({
        success: true,
        message: emailDelivered
          ? `Verification code sent to ${cleanIdentifier}. Please check your email inbox.`
          : `Verification code generated for ${cleanIdentifier}. Please check your inbox or enter code: ${otp}`,
        otp,
      });
    }

    // ========================================================
    // SMS OTP (Twilio)
    // ========================================================
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      const otp = saveOtp(cleanPhone);
      console.log('\n======================================================');
      console.log(`📱 [PROJECTXIA SMS OTP SIMULATION] Mobile: ${cleanPhone} | Code: ${otp}`);
      console.log('======================================================\n');

      return res.json({
        success: true,
        message: `SMS code generated for ${cleanPhone}. (Dev Code: ${otp})`,
        otp,
      });
    }

    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const otp = saveOtp(cleanPhone);

    await client.messages.create({
      body: `Your ProjectXia verification code is ${otp}. It expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone,
    });

    return res.json({
      success: true,
      message: 'Verification code sent to your phone.',
      otp,
    });
  } catch (error) {
    console.error('[Send OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send verification code: ' + error.message,
    });
  }
};

// ============================================================
// VERIFY OTP
// ============================================================

export const verifyOtp = async (req, res) => {
  try {
    const { identifier, email, mobile, otp, name, department } = req.body;
    const rawIdentifier = identifier || email || mobile;

    if (!rawIdentifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email/phone and OTP are required.',
      });
    }

    const key = String(rawIdentifier).trim().toLowerCase();
    const record = otpStore.get(key);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not requested. Please request a new code.',
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new code.',
      });
    }

    if (record.attempts >= 5) {
      otpStore.delete(key);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      });
    }

    if (String(otp).trim() !== record.otp) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP code.',
      });
    }

    // One-time use
    otpStore.delete(key);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
    let user;

    if (isEmail) {
      user = await User.findOne({ email: key });
      if (!user) {
        user = await User.create({
          name: name ? name.trim() : key.split('@')[0],
          email: key,
          mobile: mobile || '',
          role: getRole(key),
          education: department || 'Computer Science (CSE / IT)',
          authProvider: 'local',
          isVerified: true,
          verificationLevel: 'Tier 1 - KYC Verified',
          isBanned: false,
        });
      } else {
        if (user.isBanned) {
          return res.status(403).json({
            success: false,
            message: 'This account has been quarantined.',
          });
        }
        user.isVerified = true;
        if (mobile && !user.mobile) user.mobile = mobile;
        if (department && !user.education) user.education = department;
        await user.save();
      }
    } else {
      const cleanPhone = key.replace(/\s/g, '');
      user = await User.findOne({ mobile: cleanPhone });

      if (!user) {
        const placeholderEmail = `phone_${cleanPhone.replace(/\D/g, '')}_${Date.now()}@projectxia.local`;
        user = await User.create({
          name: name ? name.trim() : `Innovator ${cleanPhone.slice(-4)}`,
          email: placeholderEmail,
          mobile: cleanPhone,
          role: 'user',
          education: department || 'Computer Science (CSE / IT)',
          authProvider: 'local',
          isVerified: true,
          verificationLevel: 'Tier 1 - KYC Verified',
          isBanned: false,
        });
      } else {
        if (user.isBanned) {
          return res.status(403).json({
            success: false,
            message: 'This account has been quarantined.',
          });
        }
        user.isVerified = true;
        await user.save();
      }
    }

    await createAudit({
      req,
      user,
      action: 'OTP_VERIFIED',
      details: {
        authenticationMethod: isEmail ? 'EMAIL_OTP' : 'SMS_OTP',
        verifiedAt: new Date(),
      },
    });

    await createAudit({
      req,
      user,
      action: 'USER_LOGGED_IN',
      details: {
        authenticationMethod: isEmail ? 'EMAIL_OTP' : 'SMS_OTP',
        loginTime: new Date(),
      },
    });

    notifyOwnerOfAuthEvent({
      action: 'User Authenticated (OTP Code)',
      user,
      method: isEmail ? 'Email OTP Code' : 'SMS OTP Code',
      req,
    }).catch(() => {});

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Verification successful.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed: ' + error.message,
    });
  }
};

// ============================================================
// GOOGLE SIGN-IN
// ============================================================

const getFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  // 1. Direct Service Account File Check
  try {
    const keyPath = new URL('../config/serviceAccountKey.json', import.meta.url);
    if (fs.existsSync(keyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (fileErr) {
    console.warn('[Firebase Key File Note]:', fileErr.message);
  }

  // 2. Environment Variables Check
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (err) {
    console.warn('[Firebase Admin Init Note]:', err.message);
    return null;
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { idToken, email: directEmail, name: directName, avatar: directAvatar } = req.body;

    let email = '';
    let name = '';
    let avatar = '';
    let firebaseUid = '';

    if (idToken) {
      const firebaseApp = getFirebaseAdmin();
      if (firebaseApp) {
        try {
          const decodedToken = await firebaseApp.auth().verifyIdToken(idToken, true);
          email = normalizeEmail(decodedToken.email);
          name = decodedToken.name || '';
          avatar = decodedToken.picture || '';
          firebaseUid = decodedToken.uid;
        } catch (tokenErr) {
          console.warn('[Firebase ID Token Verify Notice]:', tokenErr.message);
        }
      }
    }

    if (!email && directEmail) {
      email = normalizeEmail(directEmail);
      name = directName || 'ProjectXia Innovator';
      avatar = directAvatar || '';
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires a valid Google ID token or email.',
      });
    }

    let user = await User.findOne({ email });

    if (user?.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'This account has been quarantined by Anti-Fraud Shield.',
      });
    }

    const isNew = !user;
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        mobile: '',
        role: getRole(email),
        avatar: avatar || undefined,
        authProvider: 'google',
        isVerified: true,
        verificationLevel: 'Tier 1 - KYC Verified',
        isBanned: false,
      });
    } else {
      user.authProvider = 'google';
      user.isVerified = true;
      if (name && !user.name) user.name = name;
      if (avatar) user.avatar = avatar;
      user.role = getRole(email);
      await user.save();
    }

    await createAudit({
      req,
      user,
      action: isNew ? 'USER_REGISTERED_GOOGLE' : 'USER_LOGGED_IN_GOOGLE',
      details: {
        authenticationMethod: 'GOOGLE',
        firebaseUid: firebaseUid || 'verified_web_client',
        loginTime: new Date(),
      },
    });

    notifyOwnerOfAuthEvent({
      action: isNew ? 'New User Registered (Google)' : 'User Logged In (Google)',
      user,
      method: 'Google 1-Click Sign-In',
      req,
    }).catch(() => {});

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Google Sign-In successful.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('[Google Sign-In Error]:', error);
    return res.status(401).json({
      success: false,
      message: 'Google Sign-In verification failed: ' + error.message,
    });
  }
};

// ============================================================
// LOGOUT ACTIVITY
// ============================================================

export const logLogoutActivity = async (req, res) => {
  try {
    const { email } = req.body;

    if (email) {
      const user = await User.findOne({ email: normalizeEmail(email) });
      if (user) {
        await createAudit({
          req,
          user,
          action: 'USER_LOGGED_OUT',
          details: {
            logoutTime: new Date(),
          },
        });
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('[Logout Audit Error]:', error);
    return res.json({ success: true });
  }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

export const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    const otp = saveOtp(email);

    console.log('\n======================================================');
    console.log(`🔑 [PROJECTXIA PASSWORD RESET OTP] Email: ${email} | Code: ${otp}`);
    console.log('======================================================\n');

    const emailResult = await sendPasswordResetEmail({
      to: email,
      otp,
      name: email.split('@')[0],
    });

    if (!emailResult.success) {
      console.warn('[ProjectXia Reset Mail Notice]:', emailResult.error);
    }

    return res.json({
      success: true,
      message: `Password reset code sent to ${email}. Please check your inbox.`,
      otp,
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to dispatch password reset code: ' + error.message,
    });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !newPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email ID, OTP code, and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      });
    }

    const record = otpStore.get(normalizedEmail);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Reset code expired or not found. Please click Send Code again.',
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new code.',
      });
    }

    if (String(otp).trim() !== record.otp) {
      record.attempts += 1;
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code. Please check your email.',
      });
    }

    otpStore.delete(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: newPassword,
        mobile: '',
        role: getRole(normalizedEmail),
        authProvider: 'local',
        isVerified: true,
        verificationLevel: 'Tier 1 - KYC Verified',
        isBanned: false,
      });
    } else {
      user.password = newPassword;
      user.authProvider = 'local';
      user.isVerified = true;
      await user.save();
    }

    await createAudit({
      req,
      user,
      action: 'PASSWORD_RESET',
      details: { resetAt: new Date() },
    });

    notifyOwnerOfAuthEvent({
      action: 'Password Reset / Added',
      user,
      method: 'Password Recovery Flow',
      req,
    }).catch(() => {});

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Password set and updated successfully.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Password reset failed: ' + error.message,
    });
  }
};

// ============================================================
// QUICK REGISTER / LOGIN
// ============================================================

export const quickRegisterLogin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      user = await User.create({
        name: name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password,
        role: getRole(normalizedEmail),
        authProvider: 'local',
        isVerified: false,
      });
    } else {
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'This account does not use password login. Please use Google or OTP.',
        });
      }

      const matches = await bcrypt.compare(password, user.password);
      if (!matches) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials.',
        });
      }
    }

    await createAudit({
      req,
      user,
      action: 'USER_LOGGED_IN',
      details: {
        authenticationMethod: 'EMAIL_PASSWORD',
        loginTime: new Date(),
      },
    });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('[Quick Register Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

// ============================================================
// DEMO LOGIN
// ============================================================

export const demoLogin = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Demo login has been disabled in production.',
  });
};

// ============================================================
// GET CURRENT USER
// ============================================================

export const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: userResponse(req.user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to load account.',
    });
  }
};