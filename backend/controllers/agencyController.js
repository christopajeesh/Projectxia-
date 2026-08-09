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

    const emailSubject = `🚨 [NEW CUSTOM SOFTWARE BUILD REQUEST] "${inquiryData.projectTitle}" from ${inquiryData.clientName} (${inquiryData.clientMobile})`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f3f4f6; padding: 24px; border-radius: 14px; max-width: 620px; margin: auto; border: 2px solid #06b6d4;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="color: #22d3ee; margin: 0; font-size: 20px;">🚀 PROJECTXIA CUSTOM SOFTWARE ALERT</h2>
            <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">NEW IN-HOUSE ENGINEERING LEAD RECEIVED</p>
          </div>
        </div>

        <!-- Quick Action Buttons -->
        ${waLink ? `
          <div style="margin-bottom: 16px; background-color: #064e3b; padding: 12px; border-radius: 10px; border: 1px solid #059669; text-align: center;">
            <p style="color: #a7f3d0; margin: 0 0 8px 0; font-size: 13px; font-weight: bold;">⚡ Quick Client Response:</p>
            <a href="${waLink}" target="_blank" style="background-color: #22c55e; color: #000000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 13px; display: inline-block; box-shadow: 0 4px 12px rgba(34,197,94,0.3);">
              💬 Open WhatsApp Chat with ${inquiryData.clientName}
            </a>
          </div>
        ` : ''}

        <!-- Client & Project Overview Box -->
        <div style="background-color: #0f172a; padding: 16px; border-radius: 10px; border-left: 4px solid #38bdf8;">
          <h3 style="margin-top: 0; color: #38bdf8; font-size: 15px;">📋 Client & Requirement Summary</h3>
          <p style="margin: 6px 0;"><strong>👤 Client Name:</strong> <span style="color: #ffffff;">${inquiryData.clientName}</span></p>
          <p style="margin: 6px 0;"><strong>📱 Phone / WhatsApp:</strong> <a href="tel:${inquiryData.clientMobile}" style="color: #22d3ee; font-weight: bold; font-size: 14px;">${inquiryData.clientMobile}</a></p>
          <p style="margin: 6px 0;"><strong>✉️ Email Address:</strong> <a href="mailto:${inquiryData.clientEmail}" style="color: #38bdf8;">${inquiryData.clientEmail}</a></p>
          <p style="margin: 6px 0;"><strong>💡 Project Title:</strong> <span style="color: #facc15; font-weight: bold;">${inquiryData.projectTitle}</span></p>
          <p style="margin: 6px 0;"><strong>💰 Budget Range:</strong> <span style="color: #4ade80; font-weight: bold;">${inquiryData.budgetRange || `₹${inquiryData.budget?.toLocaleString('en-IN')}`}</span></p>
          <p style="margin: 6px 0;"><strong>⏱️ Target Timeline:</strong> <span style="color: #ffffff;">${inquiryData.targetDeadline || `${inquiryData.timelineDays} Days`}</span></p>
          <p style="margin: 6px 0;"><strong>🆔 Lead Tracking ID:</strong> <span style="color: #94a3b8; font-family: monospace;">${inquiryData._id}</span></p>
        </div>

        <!-- Requirement Scope -->
        <div style="margin-top: 16px; background-color: #111827; padding: 16px; border-radius: 10px; border: 1px solid #1e293b;">
          <h4 style="color: #c084fc; margin-top: 0; font-size: 14px;">📝 Full Project Requirements / Idea Abstract:</h4>
          <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; background-color: #030712; padding: 12px; border-radius: 8px; border: 1px solid #334155;">${inquiryData.requirements || inquiryData.description}</div>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #1e293b; padding-top: 12px;">
          🛡️ ProjectXia In-House Engineering Engine • Dispatched directly to <strong>theprojectxia@gmail.com</strong>
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
    } = req.body;

    const userId = req.user?._id || req.user?.id || '';
    const name = clientName || req.user?.name || 'Software Innovator';
    const email = clientEmail || req.user?.email || 'innovator@projectxia.io';
    const mobile = clientMobile || req.user?.mobile || '+91 98765 43210';
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

    // 3. Dispatch High-Priority Email Notification to theprojectxia@gmail.com asynchronously
    dispatchTeamNotificationEmail(newInquiry).catch(err => {
      console.warn('[Agency Async Email Warning]:', err.message);
    });

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
