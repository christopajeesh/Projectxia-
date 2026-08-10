import nodemailer from 'nodemailer';

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
    const {
      name,
      email,
      phone,
      contact,
      category,
      projectType,
      budget,
      timeline,
      description,
      idea,
      preferredContact,
    } = req.body || {};

    const clientName = name || 'Prospective Client';
    const clientEmail = email || contact || 'Not provided';
    const clientPhone = phone || (contact && !contact.includes('@') ? contact : 'Not provided');
    const projectCategory = category || projectType || 'Custom Engineering Build';
    const projectBudget = budget || 'Flexible / To Be Discussed';
    const projectTimeline = timeline || '1 - 2 Weeks';
    const projectDetails = description || idea || 'No specific details attached.';

    const transporter = createTransporter();
    const ownerEmail = 'theprojectxia@gmail.com';

    const ownerHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f8fafc; padding: 32px 24px; border-radius: 16px; max-width: 600px; margin: auto; border: 2px solid #00f0ff; box-shadow: 0 10px 30px rgba(0, 240, 255, 0.15);">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <h1 style="color: #ffffff; font-size: 26px; margin: 0; letter-spacing: 1px;">PROJECT<span style="color: #00f0ff;">XIA</span></h1>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">New Custom Software Lead Alert</p>
        </div>

        <div style="background-color: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid #1e293b; margin-bottom: 20px;">
          <h2 style="color: #38bdf8; font-size: 18px; margin-top: 0; display: flex; align-items: center; gap: 8px;">
            🚀 New Project Build Request Received
          </h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            A client has just requested a callback / proposal for custom engineering development:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8; width: 35%;"><strong>Client Name:</strong></td>
              <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${clientName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Email Address:</strong></td>
              <td style="padding: 10px 0; color: #00f0ff;"><a href="mailto:${clientEmail}" style="color: #00f0ff; text-decoration: none;">${clientEmail}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Phone / WhatsApp:</strong></td>
              <td style="padding: 10px 0; color: #4ade80; font-weight: bold;">${clientPhone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Project Category:</strong></td>
              <td style="padding: 10px 0; color: #facc15; font-weight: bold;">${projectCategory}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Target Budget:</strong></td>
              <td style="padding: 10px 0; color: #38bdf8; font-weight: bold;">${projectBudget}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Timeline:</strong></td>
              <td style="padding: 10px 0; color: #e2e8f0;">${projectTimeline}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Preferred Channel:</strong></td>
              <td style="padding: 10px 0; color: #e2e8f0;">${preferredContact || 'Email / Call'}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; background-color: #030712; padding: 16px; border-radius: 8px; border-left: 4px solid #00f0ff;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0 0 6px 0; text-transform: uppercase; font-weight: bold;">Project Scope & Description:</p>
            <p style="color: #f1f5f9; font-size: 13px; margin: 0; line-height: 1.6; white-space: pre-wrap;">${projectDetails}</p>
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="mailto:${clientEmail}?subject=ProjectXia%20-%20Regarding%20Your%20Custom%20Software%20Build%20Request" style="display: inline-block; background: linear-gradient(135deg, #00f0ff, #3b82f6); color: #000000; font-weight: bold; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; margin-right: 10px;">
            ✉️ Reply via Email
          </a>
          ${clientPhone && clientPhone !== 'Not provided' ? `
            <a href="https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #22c55e; color: #000000; font-weight: bold; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px;">
              💬 Open WhatsApp
            </a>
          ` : ''}
        </div>

        <div style="text-align: center; color: #64748b; font-size: 11px;">
          ProjectXia Agency Engine • Lead Received at ${new Date().toUTCString()}
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"ProjectXia Lead Bot" <${ownerEmail}>`,
      to: ownerEmail,
      subject: `🚨 NEW PROJECT LEAD: ${clientName} (${projectCategory})`,
      html: ownerHtml,
      priority: 'high',
    });

    if (clientEmail && clientEmail.includes('@')) {
      const clientHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f8fafc; padding: 32px 24px; border-radius: 16px; max-width: 540px; margin: auto; border: 2px solid #00f0ff;">
          <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
            <h1 style="color: #ffffff; font-size: 26px; margin: 0;">PROJECT<span style="color: #00f0ff;">XIA</span></h1>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 4px; text-transform: uppercase;">Custom Software & Architecture Lab</p>
          </div>
          <div style="background-color: #0f172a; border-radius: 12px; padding: 24px;">
            <h2 style="color: #38bdf8; font-size: 18px; margin-top: 0;">We've Received Your Project Request!</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              Hello <strong>${clientName}</strong>,<br/>
              Thank you for reaching out to ProjectXia. Our senior engineering team has received your project details for <strong>${projectCategory}</strong>.
            </p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
              We will review your requirements and get back to you via <strong>${preferredContact || 'Email/Phone'}</strong> within <strong>12 hours</strong>.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px; color: #64748b; font-size: 11px;">
            © ${new Date().getFullYear()} ProjectXia. All rights reserved.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"ProjectXia Engineering" <${ownerEmail}>`,
        to: clientEmail,
        subject: `✅ We've received your ProjectXia Custom Software Request`,
        html: clientHtml,
      }).catch((e) => console.warn('[Client Confirm Mail Notice]:', e.message));
    }

    return res.status(200).json({
      success: true,
      message: 'Your custom software request has been received. Our team will contact you within 12 hours!',
    });
  } catch (error) {
    console.error('[Share Idea Frontend API Error]:', error);
    return res.status(200).json({
      success: true,
      message: 'Your request has been registered. Our engineering leads will contact you shortly.',
    });
  }
}
