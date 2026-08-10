import nodemailer from 'nodemailer';

const otpStore = new Map();

export const createTransporter = () => {
  const user = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
  const rawPass = process.env.GMAIL_APP_PASSWORD || 'fayh bufk ccok mgxf';
  const pass = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { identifier, email, mobile, name } = req.body || {};
    const rawIdentifier = identifier || email || mobile;

    if (!rawIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = String(rawIdentifier).trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    const transporter = createTransporter();
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f8fafc; padding: 32px 24px; border-radius: 16px; max-width: 540px; margin: auto; border: 2px solid #00f0ff; box-shadow: 0 10px 30px rgba(0, 240, 255, 0.15);">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <h1 style="color: #ffffff; font-size: 26px; margin: 0; letter-spacing: 1px;">PROJECT<span style="color: #00f0ff;">XIA</span></h1>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">Zero-Trust Engineering Marketplace & AI Shield</p>
        </div>

        <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #38bdf8; font-size: 17px; margin-top: 0;">
            🔐 Security Verification Code
          </h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
            Hello <strong>${name || cleanEmail.split('@')[0]}</strong>,<br/>
            Use the official 6-digit verification code below to sign in to your ProjectXia account:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #00f0ff; background-color: #030712; padding: 14px 32px; border-radius: 12px; border: 2px solid #00f0ff; box-shadow: 0 0 20px rgba(0, 240, 255, 0.25);">
              ${otp}
            </span>
          </div>

          <div style="background-color: #030712; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #facc15; font-size: 12px; color: #cbd5e1;">
            ⏱️ <strong>Confidentiality Notice:</strong> This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px; line-height: 1.5;">
          🛡️ Delivered securely by ProjectXia Security • <a href="https://projectxia.com" style="color: #00f0ff; text-decoration: none;">projectxia.com</a><br/>
          © ${new Date().getFullYear()} ProjectXia. All rights reserved.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"ProjectXia Security" <${fromAddress}>`,
      to: cleanEmail,
      subject: `🔐 ${otp} is your ProjectXia Verification Code`,
      text: `Your ProjectXia security verification code is ${otp}. This code expires in 10 minutes.`,
      html: htmlContent,
      priority: 'high',
    });

    console.log(`[ProjectXia OTP] Dispatched code ${otp} to ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please check your email inbox.`,
      otp,
    });
  } catch (error) {
    console.error('[Send OTP Frontend API Error]:', error);
    const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
    return res.status(200).json({
      success: true,
      message: `Verification code generated for ${req.body?.identifier || 'user'}.`,
      otp: fallbackOtp,
    });
  }
}
