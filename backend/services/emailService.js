import nodemailer from 'nodemailer';

// Configure Nodemailer with Gmail SMTP credentials
const createTransporter = () => {
  const user = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!pass || pass === 'your_16_char_app_password_here') {
    return null; // Development fallback
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Send 4-Digit / 6-Digit OTP Email via Gmail SMTP
 */
export const sendOtpEmail = async ({ to, otp, name = 'Innovator' }) => {
  try {
    const transporter = createTransporter();
    const fromAddress = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 520px; margin: auto; border: 1px solid #00f0ff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">PROJECT<span style="color: #00f0ff;">XIA</span></h1>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase;">Zero-Trust Engineering Escrow</p>
        </div>

        <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #1e293b;">
          <h2 style="color: #ffffff; font-size: 16px; margin-top: 0;">Security Verification Code</h2>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
            Hello <strong>${name}</strong>,<br/>
            Use the official verification code below to complete your authentication on ProjectXia:
          </p>

          <div style="text-align: center; margin: 25px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #00f0ff; background-color: #030712; padding: 12px 28px; border-radius: 10px; border: 2px solid #00f0ff;">
              ${otp}
            </span>
          </div>

          <p style="color: #64748b; font-size: 11px; margin-bottom: 0;">
            This security code is valid for 10 minutes. If you did not request this OTP, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #475569; font-size: 10px;">
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
      subject: `ProjectXia Verification OTP: ${otp}`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId, otp };
  } catch (error) {
    console.error('[ProjectXia Email Service Error]:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send Agency Custom Build Inquiry Notification to Platform Owner
 */
export const sendAgencyInquiryEmail = async ({ leadData }) => {
  try {
    const transporter = createTransporter();
    const ownerEmail = process.env.GMAIL_USER || 'theprojectxia@gmail.com';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 25px; border-radius: 14px; max-width: 550px; margin: auto; border: 1px solid #10b981;">
        <h2 style="color: #10b981; margin-top: 0;">New ProjectXia Agency Lead Received</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1;">
          <tr><td style="padding: 6px 0; color: #94a3b8;">Client Name:</td><td style="font-weight: bold; color: #fff;">${leadData.name}</td></tr>
          <tr><td style="padding: 6px 0; color: #94a3b8;">Email:</td><td>${leadData.email}</td></tr>
          <tr><td style="padding: 6px 0; color: #94a3b8;">Mobile / WhatsApp:</td><td>${leadData.mobile}</td></tr>
          <tr><td style="padding: 6px 0; color: #94a3b8;">Department:</td><td>${leadData.dept}</td></tr>
          <tr><td style="padding: 6px 0; color: #94a3b8;">Budget:</td><td style="color: #00f0ff; font-weight: bold;">${leadData.budget}</td></tr>
        </table>
        <div style="margin-top: 15px; padding: 12px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;">
          <strong>Description:</strong><br/>
          <p style="margin-top: 4px; color: #e2e8f0; font-size: 12px;">${leadData.description}</p>
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`[ProjectXia Agency Lead - DEV FALLBACK] Sent to owner: ${ownerEmail} for ${leadData.name}`);
      return { success: true, mode: 'DEV_LOG' };
    }

    const info = await transporter.sendMail({
      from: `"ProjectXia Agency Bot" <${ownerEmail}>`,
      to: ownerEmail,
      subject: `🚨 New Custom Project Inquiry: ${leadData.name} (${leadData.dept})`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[ProjectXia Agency Email Error]:', error.message);
    return { success: false, error: error.message };
  }
};
