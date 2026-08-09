import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import fs from 'fs';

import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

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

// ============================================================
// GMAIL & NODEMAILER
// ============================================================

const sendEmail = async ({ to, subject, text, html }) => {
  const user = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
  const pass = (process.env.GMAIL_APP_PASSWORD || 'fayh bufk ccok mgxf').replace(/\s+/g, '');
  const fromUser = process.env.SMTP_FROM || user;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  return await transporter.sendMail({
    from: `"ProjectXia Security" <${fromUser}>`,
    to,
    subject,
    text,
    html,
  });
};

const notifyOwnerOfAuthEvent = async ({ action, user, method, req }) => {
  try {
    const ip = req ? getClientIp(req) : '127.0.0.1';
    const userAgent = req?.headers ? req.headers['user-agent'] || 'Unknown Device' : 'Web Client';
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`\n📧 [NOTIFY OWNER theprojectxia@gmail.com] Action: ${action} | User: ${user.email} (${method})`);

    await sendEmail({
      to: OWNER_EMAIL,
      subject: `🔔 [ProjectXia Alert] ${action}: ${user.email}`,
      text: `A user event occurred on ProjectXia.\n\nAction: ${action}\nEmail ID: ${user.email}\nName: ${user.name || user.email.split('@')[0]}\nAuth Method: ${method}\nTime: ${time}\nIP Address: ${ip}\nDevice: ${userAgent}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#0b1329;color:#f8fafc;border-radius:16px;border:1px solid #38bdf850;">
          <h2 style="color:#38bdf8;margin-top:0;">🚀 ProjectXia User Activity Alert</h2>
          <div style="padding:16px;background:#1e293b;border-radius:12px;margin:16px 0;border-left:4px solid #38bdf8;">
            <p style="margin:6px 0;"><strong>Action:</strong> <span style="color:#4ade80;">${action}</span></p>
            <p style="margin:6px 0;"><strong>Email ID:</strong> <span style="color:#38bdf8;">${user.email}</span></p>
            <p style="margin:6px 0;"><strong>Name:</strong> ${user.name || user.email.split('@')[0]}</p>
            <p style="margin:6px 0;"><strong>Auth Method:</strong> ${method}</p>
            <p style="margin:6px 0;"><strong>Time (IST):</strong> ${time}</p>
            <p style="margin:6px 0;"><strong>Client IP:</strong> ${ip}</p>
            <p style="margin:6px 0;font-size:12px;color:#94a3b8;"><strong>Device / Browser:</strong> ${userAgent}</p>
          </div>
          <hr style="border:0;border-top:1px solid #334155;margin:20px 0;" />
          <small style="color:#94a3b8;">ProjectXia Automated Security Bot • Connected to MongoDB Atlas</small>
        </div>
      `,
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
        await sendEmail({
          to: cleanIdentifier,
          subject: `🔐 ${otp} is your ProjectXia Verification Code`,
          text: `Your ProjectXia security verification code is ${otp}. This code expires in 10 minutes.`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 580px; margin: auto; padding: 28px; background: #030712; color: #f8fafc; border-radius: 16px; border: 2px solid #06b6d4;">
              <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #22d3ee; margin: 0; font-size: 22px;">🔐 ProjectXia Security Verification</h2>
                <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">ONE-TIME AUTHENTICATION CODE</p>
              </div>

              <p style="font-size: 15px; color: #e2e8f0; margin-bottom: 8px;">Hello <strong>${name || cleanIdentifier.split('@')[0]}</strong>,</p>
              <p style="font-size: 14px; color: #94a3b8; margin-bottom: 20px;">Use the 6-digit verification code below to sign in or verify your ProjectXia account:</p>

              <div style="font-size: 38px; font-weight: 900; letter-spacing: 12px; text-align: center; padding: 20px; background: #0f172a; border-radius: 12px; margin: 24px 0; color: #38bdf8; border: 1px solid #38bdf860; box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2);">
                ${otp}
              </div>

              <div style="background: #0f172a; padding: 14px; border-radius: 10px; border-left: 4px solid #facc15; font-size: 13px; color: #cbd5e1; margin-bottom: 20px;">
                ⏱️ <strong>Validity:</strong> This OTP is strictly confidential and expires in <strong>10 minutes</strong>. Never share this code with anyone.
              </div>

              <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0 16px 0;" />
              <p style="text-align: center; color: #64748b; font-size: 11px; margin: 0;">
                🛡️ ProjectXia Anti-Fraud & Cyber Security Engine • <a href="https://projectxia.com" style="color: #06b6d4; text-decoration: none;">projectxia.com</a>
              </p>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error(`[ProjectXia OTP Send Error]:`, mailErr.message);
        return res.status(500).json({
          success: false,
          message: 'Unable to deliver OTP email to ' + cleanIdentifier + '. Please verify your email address.',
        });
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
        message: `Verification code sent to ${cleanIdentifier}. Please check your email inbox.`,
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

    try {
      await sendEmail({
        to: email,
        subject: 'ProjectXia password reset code',
        text: `Your ProjectXia password recovery code is ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#0f172a;color:#f8fafc;border-radius:16px;">
            <h2 style="color:#38bdf8;">ProjectXia Password Recovery</h2>
            <p>Your 6-digit security code to reset or set your password is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#1e293b;border-radius:12px;margin:20px 0;color:#38bdf8;border:1px solid #38bdf840;">
              ${otp}
            </div>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <hr style="border:1px solid #334155;margin:20px 0;" />
            <small style="color:#94a3b8;">ProjectXia Cyber Security Standard</small>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn('[ProjectXia Reset Mail Notice]:', mailErr.message);
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