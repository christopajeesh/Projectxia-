import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Universal Gmail Transporter Factory
 * Sanitizes app password (stripping spaces) and applies reliable timeouts
 */
export const createTransporter = () => {
  const user = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
  const rawPass = process.env.GMAIL_APP_PASSWORD || 'fayh bufk ccok mgxf';
  const pass = rawPass.replace(/\s+/g, '');

  if (!pass || pass === 'your_16_char_app_password_here') {
    return null;
  }

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

/**
 * Send 6-Digit Verification OTP to User via Gmail SMTP
 */
export const sendOtpEmail = async ({ to, otp, name = 'Innovator' }) => {
  try {
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
            Hello <strong>${name}</strong>,<br/>
            Use the official 6-digit verification code below to complete your authentication on ProjectXia:
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
          🛡️ Delivered securely by ProjectXia Security Bot • <a href="https://projectxia.com" style="color: #00f0ff; text-decoration: none;">projectxia.com</a><br/>
          © ${new Date().getFullYear()} ProjectXia Engineering Hub. All rights reserved.
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`[ProjectXia Email Service - DEV FALLBACK] To: ${to} | OTP: ${otp}`);
      return { success: true, mode: 'DEV_LOG', otp };
    }

    const info = await transporter.sendMail({
      from: `"ProjectXia Security" <${fromAddress}>`,
      to,
      subject: `🔐 ${otp} is your ProjectXia Verification Code`,
      text: `Your ProjectXia security verification code is ${otp}. This code expires in 10 minutes.`,
      html: htmlContent,
      priority: 'high',
    });

    console.log(`[ProjectXia Email Service]: OTP dispatched successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, otp };
  } catch (error) {
    console.error('[ProjectXia Email Service Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Password Reset OTP Email
 */
export const sendPasswordResetEmail = async ({ to, otp, name = 'Innovator' }) => {
  try {
    const transporter = createTransporter();
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f8fafc; padding: 32px 24px; border-radius: 16px; max-width: 540px; margin: auto; border: 2px solid #a855f7;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <h1 style="color: #ffffff; font-size: 26px; margin: 0;">PROJECT<span style="color: #a855f7;">XIA</span></h1>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase;">Password Recovery Service</p>
        </div>

        <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #c084fc; font-size: 17px; margin-top: 0;">🔑 Reset Your ProjectXia Password</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Hello <strong>${name}</strong>,<br/>
            We received a request to reset your password. Use the 6-digit recovery code below:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #c084fc; background-color: #030712; padding: 14px 32px; border-radius: 12px; border: 2px solid #a855f7;">
              ${otp}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
            This recovery code is valid for 10 minutes. If you did not request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`[ProjectXia Password Reset - DEV FALLBACK] To: ${to} | OTP: ${otp}`);
      return { success: true, mode: 'DEV_LOG', otp };
    }

    const info = await transporter.sendMail({
      from: `"ProjectXia Account Recovery" <${fromAddress}>`,
      to,
      subject: `🔑 ${otp} is your ProjectXia Password Reset Code`,
      html: htmlContent,
      priority: 'high',
    });

    return { success: true, messageId: info.messageId, otp };
  } catch (error) {
    console.error('[ProjectXia Password Reset Email Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Immediate Custom Software Build & Request Call Alert to theprojectxia@gmail.com
 */
export const sendAgencyInquiryEmail = async ({ leadData }) => {
  try {
    const transporter = createTransporter();
    const ownerEmail = 'theprojectxia@gmail.com';
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const cleanPhone = leadData.clientMobile ? String(leadData.clientMobile).replace(/[^0-9]/g, '') : '';
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waLink = waPhone ? `https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(leadData.clientName || 'there')},%20we%20received%20your%20custom%20software%20project%20request%20on%20ProjectXia!` : '';

    const subject = `🚨 [NEW CUSTOM SOFTWARE PROJECT REQUEST] "${leadData.projectTitle || leadData.department || 'Custom Build'}" - ${leadData.clientName} (${leadData.clientMobile})`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f3f4f6; padding: 28px; border-radius: 16px; max-width: 620px; margin: auto; border: 2px solid #06b6d4; box-shadow: 0 12px 40px rgba(6, 182, 212, 0.25);">
        
        <!-- Header Banner -->
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #083344; color: #22d3ee; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; border: 1px solid #06b6d4;">
            ⚡ HIGH-PRIORITY INCOMING LEAD
          </div>
          <h2 style="color: #22d3ee; margin: 0; font-size: 22px;">🚀 ProjectXia Custom Software & Call Request</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Received direct from client on ProjectXia Platform</p>
        </div>

        <!-- Quick Contact Action Bar -->
        <div style="margin-bottom: 20px; background-color: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
          <p style="color: #94a3b8; margin: 0 0 12px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
            ⚡ Instant One-Tap Reachout Options:
          </p>
          <div style="text-align: center;">
            ${waLink ? `
              <a href="${waLink}" target="_blank" style="background-color: #22c55e; color: #000000; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; margin: 4px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);">
                💬 Chat on WhatsApp (${leadData.clientMobile})
              </a>
            ` : ''}
            <a href="tel:${leadData.clientMobile}" style="background-color: #0284c7; color: #ffffff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; margin: 4px;">
              📞 Call ${leadData.clientMobile}
            </a>
            <a href="mailto:${leadData.clientEmail}" style="background-color: #a855f7; color: #ffffff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; margin: 4px;">
              ✉️ Email Client
            </a>
          </div>
        </div>

        <!-- Client & Lead Details Box -->
        <div style="background-color: #0f172a; padding: 20px; border-radius: 12px; border-left: 5px solid #06b6d4; border: 1px solid #1e293b;">
          <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">
            📋 Client & Project Specifications
          </h3>
          
          <table style="width: 100%; font-size: 14px; color: #e2e8f0; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; width: 150px;"><strong>👤 Client Name:</strong></td>
              <td style="padding: 8px 0; color: #ffffff; font-weight: bold; font-size: 15px;">${leadData.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>📱 Mobile / WhatsApp:</strong></td>
              <td style="padding: 8px 0;"><a href="tel:${leadData.clientMobile}" style="color: #22d3ee; font-weight: bold; text-decoration: none; font-size: 15px;">${leadData.clientMobile}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>✉️ Email Address:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${leadData.clientEmail}" style="color: #38bdf8; text-decoration: none;">${leadData.clientEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>💡 Project Concept:</strong></td>
              <td style="padding: 8px 0; color: #facc15; font-weight: bold;">${leadData.projectTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>🏫 Department / Field:</strong></td>
              <td style="padding: 8px 0; color: #ffffff;">${leadData.department || leadData.dept || 'Engineering'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>💰 Budget Range:</strong></td>
              <td style="padding: 8px 0; color: #4ade80; font-weight: bold; font-size: 15px;">${leadData.budgetRange || `₹${leadData.budget?.toLocaleString('en-IN')}`}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>⏱️ Target Timeline:</strong></td>
              <td style="padding: 8px 0; color: #ffffff;">${leadData.targetDeadline || `${leadData.timelineDays || 14} Days`}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8;"><strong>🆔 Lead Tracking ID:</strong></td>
              <td style="padding: 8px 0; color: #64748b; font-family: monospace;">${leadData._id || 'INQ-' + Date.now()}</td>
            </tr>
          </table>
        </div>

        <!-- Full Requirement Scope -->
        <div style="margin-top: 20px; background-color: #111827; padding: 18px; border-radius: 12px; border: 1px solid #1e293b;">
          <h4 style="color: #c084fc; margin-top: 0; font-size: 14px;">📝 Project Requirements & Description:</h4>
          <div style="color: #f8fafc; font-size: 14px; line-height: 1.6; white-space: pre-wrap; background-color: #030712; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
${leadData.requirements || leadData.description || 'Custom software build requested.'}
          </div>
        </div>

        <div style="margin-top: 24px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #1e293b; padding-top: 16px;">
          🛡️ ProjectXia In-House Engineering Engine • Delivered live to <strong>theprojectxia@gmail.com</strong>
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`[ProjectXia Agency Lead - DEV FALLBACK] Sent to owner: ${ownerEmail} for ${leadData.clientName}`);
      return { success: true, mode: 'DEV_LOG' };
    }

    const info = await transporter.sendMail({
      from: `"ProjectXia Software Lead Alert" <${fromAddress}>`,
      to: ownerEmail,
      replyTo: leadData.clientEmail || fromAddress,
      subject,
      html: htmlContent,
      priority: 'high',
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    });

    console.log(`\n======================================================`);
    console.log(`📧 [PROJECTXIA CUSTOM BUILD ALERT DELIVERED TO theprojectxia@gmail.com]`);
    console.log(`👤 Client: ${leadData.clientName} (${leadData.clientMobile})`);
    console.log(`💡 Concept: ${leadData.projectTitle}`);
    console.log(`🆔 Message ID: ${info.messageId}`);
    console.log(`======================================================\n`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[ProjectXia Agency Email Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Confirmation Email to Client after submitting custom software inquiry
 */
export const sendClientInquiryConfirmation = async ({ leadData }) => {
  try {
    if (!leadData.clientEmail || !leadData.clientEmail.includes('@')) return;

    const transporter = createTransporter();
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f8fafc; padding: 32px 24px; border-radius: 16px; max-width: 550px; margin: auto; border: 2px solid #10b981;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">PROJECT<span style="color: #10b981;">XIA</span></h1>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase;">In-House Engineering Agency</p>
        </div>

        <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b;">
          <h2 style="color: #34d399; font-size: 18px; margin-top: 0;">✅ Your Project Request is Confirmed!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Hello <strong>${leadData.clientName}</strong>,<br/>
            Thank you for trusting ProjectXia! We have received your specifications for <strong>"${leadData.projectTitle || 'Custom Software Project'}"</strong>.
          </p>

          <div style="background-color: #064e3b30; border: 1px solid #10b98150; padding: 14px; border-radius: 10px; margin: 16px 0; color: #a7f3d0; font-size: 13px;">
            ⚡ <strong>Guaranteed Callback:</strong> Our senior engineering team is reviewing your requirements and will reach out to you via <strong>WhatsApp / Phone (${leadData.clientMobile})</strong> within <strong>12 hours</strong>.
          </div>

          <div style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Estimated Budget:</strong> ${leadData.budgetRange || `₹${leadData.budget?.toLocaleString('en-IN')}`}</p>
            <p style="margin: 4px 0;"><strong>Target Timeline:</strong> ${leadData.targetDeadline || '2-3 Weeks'}</p>
            <p style="margin: 4px 0;"><strong>Escrow Protection:</strong> 3-Stage Milestone Delivery (Zero Advance Risk)</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 11px;">
          Need immediate support? Contact our leadership directly at <strong style="color: #10b981;">theprojectxia@gmail.com</strong>
        </div>
      </div>
    `;

    if (!transporter) return { success: true, mode: 'DEV_LOG' };

    await transporter.sendMail({
      from: `"ProjectXia Engineering Team" <${fromAddress}>`,
      to: leadData.clientEmail,
      subject: `✅ We received your ProjectXia Custom Software Request: "${leadData.projectTitle || 'Custom Project'}"`,
      html: htmlContent,
    });
  } catch (err) {
    console.warn('[Client Confirmation Email Notice]:', err.message);
  }
};

/**
 * Send Security Alert / Auth Event to Owner theprojectxia@gmail.com
 */
export const sendAuthAlertEmail = async ({ action, user, method, ip = '127.0.0.1', userAgent = 'Web Client' }) => {
  try {
    const transporter = createTransporter();
    const ownerEmail = 'theprojectxia@gmail.com';
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
    const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #0b1329; color: #f8fafc; border-radius: 16px; border: 1px solid #38bdf850;">
        <h2 style="color: #38bdf8; margin-top: 0;">🚀 ProjectXia User Activity Alert</h2>
        <div style="padding: 16px; background: #1e293b; border-radius: 12px; margin: 16px 0; border-left: 4px solid #38bdf8;">
          <p style="margin: 6px 0;"><strong>Action:</strong> <span style="color: #4ade80;">${action}</span></p>
          <p style="margin: 6px 0;"><strong>Email ID:</strong> <span style="color: #38bdf8;">${user.email}</span></p>
          <p style="margin: 6px 0;"><strong>Name:</strong> ${user.name || user.email.split('@')[0]}</p>
          <p style="margin: 6px 0;"><strong>Auth Method:</strong> ${method}</p>
          <p style="margin: 6px 0;"><strong>Time (IST):</strong> ${time}</p>
          <p style="margin: 6px 0;"><strong>Client IP:</strong> ${ip}</p>
          <p style="margin: 6px 0; font-size: 12px; color: #94a3b8;"><strong>Device / Browser:</strong> ${userAgent}</p>
        </div>
        <small style="color: #94a3b8;">ProjectXia Automated Security Bot • Connected to MongoDB Atlas</small>
      </div>
    `;

    if (!transporter) return;

    await transporter.sendMail({
      from: `"ProjectXia Security Bot" <${fromAddress}>`,
      to: ownerEmail,
      subject: `🔔 [ProjectXia Alert] ${action}: ${user.email}`,
      html: htmlContent,
    });
  } catch (err) {
    console.warn('[ProjectXia Owner Notification Warning]:', err.message);
  }
};

/**
 * Send Project Listing / Plagiarism Notification to Owner
 */
export const sendProjectAlertEmail = async ({ project, uploader, isSuspicious, flags = [], ip = '127.0.0.1' }) => {
  try {
    const transporter = createTransporter();
    const ownerEmail = 'theprojectxia@gmail.com';
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const subject = isSuspicious
      ? `🚨 [SUSPICIOUS PROJECT FLAGGED] Potential Copied/Cloned Source: "${project.title}"`
      : `🛡️ [NEW PROJECT LISTED & VERIFIED] "${project.title}" by ${uploader.name || uploader.email}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #030712; color: #f1f5f9; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid ${isSuspicious ? '#ef4444' : '#06b6d4'};">
        <h2 style="color: ${isSuspicious ? '#ef4444' : '#22d3ee'}; margin-top: 0;">
          ${isSuspicious ? '🚨 ANTI-PLAGIARISM SHIELD WARNING' : '✅ PROJECTXIA VERIFIED PROJECT LISTING'}
        </h2>
        <div style="background: #0f172a; padding: 16px; border-radius: 8px; border-left: 4px solid ${isSuspicious ? '#ef4444' : '#10b981'};">
          <p><strong>Project Title:</strong> ${project.title}</p>
          <p><strong>Category:</strong> ${project.category}</p>
          <p><strong>Price:</strong> ₹${project.price?.toLocaleString('en-IN')}</p>
          <p><strong>Uploader:</strong> ${uploader.name || 'Creator'} (${uploader.email})</p>
          <p><strong>Originality Trust Score:</strong> ${project.trustScore}%</p>
          <p><strong>Calculated Plagiarism:</strong> ${project.plagiarismScore}%</p>
          <p><strong>IP Address:</strong> ${ip}</p>
        </div>
        ${isSuspicious ? `
          <div style="margin-top: 16px; background: #450a0a; border: 1px solid #dc2626; padding: 14px; border-radius: 8px; color: #fca5a5;">
            <h4 style="margin-top: 0; color: #f87171;">⚠️ Suspicion & Plagiarism Flags:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${flags.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;

    if (!transporter) return;

    await transporter.sendMail({
      from: `"ProjectXia Vault Security" <${fromAddress}>`,
      to: ownerEmail,
      subject,
      html: htmlContent,
    });
  } catch (err) {
    console.warn('[Project Notification Warning]:', err.message);
  }
};
