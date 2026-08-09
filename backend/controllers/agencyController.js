import crypto from 'crypto';
import AgencyLead from '../models/AgencyLead.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const agencyStore = {
  inquiries: [],
};

// Helper: Dispatch High-Priority Email Alert to theprojectxia@gmail.com
const dispatchTeamNotificationEmail = async (inquiryData) => {
  try {
    const gmailUser = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD || 'fayh bufk ccok mgxf';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 6000,
    });

    const cleanPhone = inquiryData.clientMobile ? inquiryData.clientMobile.replace(/[^0-9]/g, '') : '';
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waLink = waPhone ? `https://wa.me/${waPhone}?text=Hi%20${encodeURIComponent(inquiryData.clientName || 'there')},%20we%20received%20your%20custom%20software%20project%20request%20on%20ProjectXia!` : '';

    const emailSubject = `🚨 [NEW CUSTOM SOFTWARE BUILD REQUEST] "${inquiryData.projectTitle}" - ${inquiryData.clientName} (${inquiryData.clientMobile})`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f3f4f6; padding: 24px; border-radius: 14px; max-width: 620px; margin: auto; border: 2px solid #06b6d4;">
        <div style="border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #22d3ee; margin: 0; font-size: 20px;">🚀 PROJECTXIA CUSTOM SOFTWARE ALERT</h2>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">NEW IN-HOUSE ENGINEERING LEAD RECEIVED</p>
        </div>

        <!-- Quick Contact Action Bar -->
        <div style="margin-bottom: 16px; background-color: #0f172a; padding: 14px; border-radius: 10px; border: 1px solid #334155; text-align: center;">
          <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Instant Client Reachout Options:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
            ${waLink ? `
              <a href="${waLink}" target="_blank" style="background-color: #22c55e; color: #000000; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; margin: 4px;">
                💬 Chat on WhatsApp (${inquiryData.clientMobile})
              </a>
            ` : ''}
            <a href="tel:${inquiryData.clientMobile}" style="background-color: #0284c7; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; margin: 4px;">
              📞 Call ${inquiryData.clientMobile}
            </a>
            <a href="mailto:${inquiryData.clientEmail}" style="background-color: #a855f7; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; margin: 4px;">
              ✉️ Email ${inquiryData.clientEmail}
            </a>
          </div>
        </div>

        <!-- Client & Lead Details Box -->
        <div style="background-color: #0f172a; padding: 18px; border-radius: 10px; border-left: 5px solid #06b6d4;">
          <h3 style="margin-top: 0; color: #38bdf8; font-size: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">📋 Client Information</h3>
          
          <table style="width: 100%; font-size: 14px; color: #e2e8f0; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8; width: 140px;"><strong>👤 Full Name:</strong></td>
              <td style="padding: 6px 0; color: #ffffff; font-weight: bold; font-size: 15px;">${inquiryData.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>📱 Phone / WhatsApp:</strong></td>
              <td style="padding: 6px 0;"><a href="tel:${inquiryData.clientMobile}" style="color: #22d3ee; font-weight: bold; text-decoration: none; font-size: 15px;">${inquiryData.clientMobile}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>✉️ Email Address:</strong></td>
              <td style="padding: 6px 0;"><a href="mailto:${inquiryData.clientEmail}" style="color: #38bdf8; text-decoration: none;">${inquiryData.clientEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>💡 Software Title:</strong></td>
              <td style="padding: 6px 0; color: #facc15; font-weight: bold;">${inquiryData.projectTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>💰 Budget Range:</strong></td>
              <td style="padding: 6px 0; color: #4ade80; font-weight: bold;">${inquiryData.budgetRange || `₹${inquiryData.budget?.toLocaleString('en-IN')}`}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>⏱️ Target Timeline:</strong></td>
              <td style="padding: 6px 0; color: #ffffff;">${inquiryData.targetDeadline || `${inquiryData.timelineDays} Days`}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;"><strong>🆔 Lead Tracking ID:</strong></td>
              <td style="padding: 6px 0; color: #64748b; font-family: monospace;">${inquiryData._id}</td>
            </tr>
          </table>
        </div>

        <!-- Full Requirement Scope -->
        <div style="margin-top: 16px; background-color: #111827; padding: 16px; border-radius: 10px; border: 1px solid #1e293b;">
          <h4 style="color: #c084fc; margin-top: 0; font-size: 14px;">📝 Project Requirements & Features:</h4>
          <div style="color: #f8fafc; font-size: 14px; line-height: 1.6; white-space: pre-wrap; background-color: #030712; padding: 14px; border-radius: 8px; border: 1px solid #334155;">${inquiryData.requirements || inquiryData.description}</div>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #1e293b; padding-top: 12px;">
          🛡️ ProjectXia In-House Engineering Engine • Delivered to <strong>theprojectxia@gmail.com</strong>
        </div>
      </div>
    `;

    const targetEmail = 'theprojectxia@gmail.com';
    const info = await transporter.sendMail({
      from: `"ProjectXia Software Alert" <${gmailUser}>`,
      to: targetEmail,
      replyTo: inquiryData.clientEmail || gmailUser,
      subject: emailSubject,
      html: emailHtml,
      priority: 'high',
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
      },
    });

    console.log(`\n======================================================`);
    console.log(`📧 [PROJECTXIA CUSTOM BUILD ALERT DELIVERED]`);
    console.log(`📩 Target Recipient: ${targetEmail}`);
    console.log(`👤 Client: ${inquiryData.clientName} (${inquiryData.clientMobile})`);
    console.log(`💡 Project: ${inquiryData.projectTitle}`);
    console.log(`🆔 Message ID: ${info.messageId}`);
    console.log(`======================================================\n`);
  } catch (emailErr) {
    console.warn('[Agency Email Dispatch Warning]:', emailErr.message);
  }
};

// @desc    Submit Software Idea or Request Call Back (Exclusively for ProjectXia Developing Team)
// @route   POST /api/agency/inquire
// @route   POST /api/agency/share-idea-callback
export const submitCustomInquiry = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientMobile,
      department,
      projectTitle,
      requirements,
      description,
      budget,
      budgetRange,
      timelineDays = 14,
      targetDeadline,
      consultationMode = 'PHONE_CALL',
      preferredTimeSlot = 'Flexible (10 AM - 8 PM)',
      type = 'IDEA_SUBMISSION',
      techPreferences,
      docLink,
      ndaSigned = true,
    } = req.body || {};

    // Server-Side Anti-Fake / Anti-Spam Validation
    const trimmedName = String(clientName || '').trim();
    if (trimmedName && (trimmedName.length < 2 || /^(asdf|qwerty|test|xyz|abc|user|unknown)$/i.test(trimmedName))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a genuine full name.',
      });
    }

    // Validate Phone Number
    const rawPhone = String(clientMobile || '').replace(/[^0-9]/g, '');
    if (!rawPhone || rawPhone.length < 10 || rawPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile or WhatsApp number.',
      });
    }

    const fakeSequences = [
      '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
      '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
      '1234567890', '0987654321', '9876543210', '0123456789', '1212121212',
      '9898989898', '9090909090', '7878787878', '9999900000', '1234512345'
    ];
    if (fakeSequences.some(seq => rawPhone.includes(seq)) || new Set(rawPhone.split('')).size < 4) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an active, genuine phone number (dummy/test numbers are blocked).',
      });
    }

    // Validate Email Address
    const trimmedEmail = String(clientEmail || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address (e.g. yourname@gmail.com).',
      });
    }

    const [localPart, domainPart] = trimmedEmail.split('@');
    if (!localPart || localPart.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid personal or university email address.',
      });
    }

    const disposableDomains = [
      'tempmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com',
      'throwawaymail.com', 'yopmail.com', 'fakeinbox.com', 'trashmail.com',
      'temp-mail.org', 'sharklasers.com', 'getairmail.com', 'dispostable.com'
    ];
    if (disposableDomains.includes(domainPart)) {
      return res.status(400).json({
        success: false,
        message: 'Temporary/disposable email addresses are not accepted. Please use your genuine email.',
      });
    }

    const userId = req.user?._id || req.user?.id || '';
    const name = trimmedName || req.user?.name || 'Software Innovator';
    const email = trimmedEmail || req.user?.email || 'innovator@projectxia.io';
    const mobile = rawPhone;
    const title = projectTitle || (requirements ? (requirements.length > 30 ? requirements.slice(0, 30) + '...' : requirements) : 'Custom Software Project');
    const reqText = requirements || description || 'Custom software build request.';

    const parsedBudget = Number(budget) || (budgetRange ? parseInt(budgetRange.replace(/[^0-9]/g, '')) || 25000 : 25000);
    const p1 = Math.round(parsedBudget * 0.3);
    const p2 = Math.round(parsedBudget * 0.4);
    const p3 = parsedBudget - p1 - p2;

    const newInquiry = {
      _id: `inq_${crypto.randomBytes(4).toString('hex')}`,
      userId: String(userId),
      clientName: name,
      clientEmail: email,
      clientMobile: mobile,
      department: department || 'Computer Science (CSE / IT)',
      projectTitle: title,
      requirements: reqText,
      description: reqText,
      budget: parsedBudget,
      budgetRange: budgetRange || `₹${parsedBudget.toLocaleString('en-IN')}`,
      timelineDays: Number(timelineDays) || 14,
      targetDeadline: targetDeadline || `${timelineDays} Days`,
      consultationMode,
      preferredTimeSlot,
      type: type || 'IDEA_SUBMISSION',
      techPreferences: Array.isArray(techPreferences) ? techPreferences : ['React', 'Node.js', 'Python', 'AI/ML'],
      docLink: docLink || '',
      assignedTeam: 'ProjectXia Core Developing Team',
      ndaSigned: !!ndaSigned,
      status: 'PENDING_REVIEW',
      milestones: [
        { phase: 1, title: 'Phase 1: Architecture Blueprint, SRS & Database ERD', percentage: 30, amount: p1, status: 'ESCROW_READY' },
        { phase: 2, title: 'Phase 2: Core Backend Engine, Frontend & Live API Demo', percentage: 40, amount: p2, status: 'PENDING' },
        { phase: 3, title: 'Phase 3: Source Code Handover, Deployment & IEEE Documentation', percentage: 30, amount: p3, status: 'PENDING' },
      ],
      createdAt: new Date(),
    };

    // 1. Save to MongoDB Atlas if connected (Gracefully handled if offline)
    try {
      await AgencyLead.create({
        name: newInquiry.clientName,
        email: newInquiry.clientEmail,
        mobile: newInquiry.clientMobile,
        dept: newInquiry.department,
        projectType: 'Exclusive Software Only (ProjectXia Team)',
        budget: newInquiry.budgetRange,
        description: newInquiry.requirements,
        userId: newInquiry.userId,
        type: newInquiry.type,
        consultationMode: newInquiry.consultationMode,
        preferredTimeSlot: newInquiry.preferredTimeSlot,
        targetDeadline: newInquiry.targetDeadline,
        techPreferences: newInquiry.techPreferences,
        docLink: newInquiry.docLink,
        assignedTeam: newInquiry.assignedTeam,
        milestones: newInquiry.milestones,
        status: newInquiry.status,
      });
    } catch (dbErr) {
      console.warn('[AgencyLead DB Save Warning]:', dbErr.message);
    }

    // 2. Add to in-memory store
    agencyStore.inquiries.unshift(newInquiry);

    // 3. Dispatch High-Priority Email Notification to theprojectxia@gmail.com (Awaited to ensure serverless delivery)
    try {
      await dispatchTeamNotificationEmail(newInquiry);
    } catch (mailErr) {
      console.warn('[Agency Async Email Warning]:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Your custom software idea has been received and assigned directly to the ProjectXia Developing Team!',
      inquiry: newInquiry,
    });
  } catch (error) {
    console.error('[Submit Custom Inquiry Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit software inquiry.',
      error: error.message,
    });
  }
};

// @desc    Get Current User's Software Inquiries & Ideas
// @route   GET /api/agency/my-inquiries
export const getMyInquiries = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.user?.id || '');
    const userEmail = String(req.user?.email || '').toLowerCase();

    let dbLeads = [];
    try {
      dbLeads = await AgencyLead.find({
        $or: [
          { userId: userId },
          { email: userEmail },
        ],
      }).sort({ createdAt: -1 });
    } catch (e) {
      dbLeads = [];
    }

    // Merge with memory store
    const memLeads = agencyStore.inquiries.filter(
      i => (userId && String(i.userId) === userId) || (userEmail && String(i.clientEmail).toLowerCase() === userEmail)
    );

    const merged = [...dbLeads, ...memLeads.filter(m => !dbLeads.some(d => String(d._id) === String(m._id)))];

    return res.status(200).json({
      success: true,
      inquiries: merged,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your inquiries.',
      error: error.message,
    });
  }
};

// @desc    Get All Agency Inquiries & Milestones (Admin View)
// @route   GET /api/agency/quotes
export const getAgencyQuotes = async (req, res) => {
  let dbLeads = [];
  try {
    dbLeads = await AgencyLead.find().sort({ createdAt: -1 });
  } catch (e) {
    dbLeads = [];
  }

  const merged = [...dbLeads, ...agencyStore.inquiries.filter(m => !dbLeads.some(d => String(d._id) === String(m._id)))];

  return res.status(200).json({
    success: true,
    inquiries: merged,
  });
};

// @desc    Release Milestone Funds from Escrow
// @route   POST /api/agency/milestones/:id/release
export const releaseMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { phase } = req.body;

    const inq = agencyStore.inquiries.find(i => i._id === id);
    if (!inq) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    const milestone = inq.milestones?.find(m => m.phase === Number(phase));
    if (milestone) {
      milestone.status = 'APPROVED_AND_RELEASED';
    }

    return res.status(200).json({
      success: true,
      message: `Milestone Phase ${phase} funds released to ProjectXia developing team.`,
      inquiry: inq,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to release milestone.',
      error: error.message,
    });
  }
};
