import crypto from 'crypto';
import AgencyLead from '../models/AgencyLead.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const agencyStore = {
  inquiries: [],
};

// Helper: Dispatch Email Notification to ProjectXia Developing Team
const dispatchTeamNotificationEmail = async (inquiryData) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const isCallback = inquiryData.type === 'CALLBACK_REQUEST';
    const emailSubject = isCallback
      ? `🚨 [URGENT CALLBACK ENQUIRY] ProjectXia Developing Team: ${inquiryData.clientName}`
      : `💡 [NEW SOFTWARE IDEA SUBMITTED] Exclusive Build Request: ${inquiryData.projectTitle}`;

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f3f4f6; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #06b6d4;">
        <h2 style="color: #22d3ee; margin-bottom: 4px;">🚀 PROJECTXIA DEVELOPING TEAM</h2>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">EXCLUSIVE IN-HOUSE SOFTWARE PROJECT REQUEST</p>
        <hr style="border-color: #1e293b; margin: 16px 0;" />

        <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; border-left: 4px solid #38bdf8;">
          <h3 style="margin-top: 0; color: #ffffff;">${isCallback ? '📞 Instant Callback Enquiry' : '💡 Custom Software Project Idea'}</h3>
          <p><strong>Client Name:</strong> ${inquiryData.clientName}</p>
          <p><strong>Email:</strong> ${inquiryData.clientEmail}</p>
          <p><strong>WhatsApp / Mobile:</strong> ${inquiryData.clientMobile}</p>
          <p><strong>Department / Category:</strong> ${inquiryData.department || 'Computer Science (CSE / IT)'}</p>
          <p><strong>Project Title / Topic:</strong> ${inquiryData.projectTitle}</p>
          <p><strong>Budget Range:</strong> ${inquiryData.budgetRange || `₹${inquiryData.budget?.toLocaleString('en-IN')}`}</p>
          <p><strong>Preferred Consultation:</strong> ${inquiryData.consultationMode || 'Phone Call'} (${inquiryData.preferredTimeSlot || 'Flexible'})</p>
          <p><strong>Target Timeline:</strong> ${inquiryData.targetDeadline || `${inquiryData.timelineDays} Days`}</p>
          ${inquiryData.docLink ? `<p><strong>Specs Link:</strong> <a href="${inquiryData.docLink}" style="color: #38bdf8;">${inquiryData.docLink}</a></p>` : ''}
        </div>

        <div style="margin-top: 16px; background-color: #111827; padding: 14px; border-radius: 8px;">
          <h4 style="color: #a855f7; margin-top: 0;">📝 Project Requirements / Idea Abstract:</h4>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${inquiryData.requirements || inquiryData.description}</p>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #64748b; font-size: 11px;">
          <p>🛡️ Handled Exclusively by ProjectXia In-House Engineering Team • 100% In-House Developers • Full IP Transfer</p>
        </div>
      </div>
    `;

    const targetEmail = 'theprojectxia@gmail.com';
    const info = await transporter.sendMail({
      from: `"ProjectXia Software Lead" <${process.env.GMAIL_USER}>`,
      to: targetEmail,
      replyTo: inquiryData.clientEmail || process.env.GMAIL_USER,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`\n======================================================`);
    console.log(`📧 [PROJECTXIA DEVELOPING TEAM NOTIFICATION DISPATCHED]`);
    console.log(`📩 Target Recipient: ${targetEmail}`);
    console.log(`🏷️ Subject: ${emailSubject}`);
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
      type = 'IDEA_SUBMISSION', // 'IDEA_SUBMISSION' or 'CALLBACK_REQUEST'
      techPreferences,
      docLink,
      ndaSigned = true,
    } = req.body;

    const userId = req.user?._id || req.user?.id || '';
    const name = clientName || req.user?.name || 'Software Innovator';
    const email = clientEmail || req.user?.email || 'innovator@projectxia.io';
    const mobile = clientMobile || req.user?.mobile || '+91 98765 43210';
    const title = projectTitle || (type === 'CALLBACK_REQUEST' ? 'Custom Software Consultation & Scope Enquiry' : 'Proprietary Software Architecture');
    const reqText = requirements || description || (type === 'CALLBACK_REQUEST' ? 'Requested instant phone consultation with ProjectXia Lead Developer to discuss custom software architecture and scope.' : 'Custom software build request.');

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
      type,
      techPreferences: Array.isArray(techPreferences) ? techPreferences : ['React', 'Node.js', 'Python', 'AI/ML'],
      docLink: docLink || '',
      assignedTeam: 'ProjectXia Core Developing Team',
      ndaSigned: !!ndaSigned,
      status: type === 'CALLBACK_REQUEST' ? 'CALLBACK_SCHEDULED' : 'PENDING_REVIEW',
      milestones: [
        { phase: 1, title: 'Phase 1: Architecture Blueprint, SRS & Database ERD', percentage: 30, amount: p1, status: 'ESCROW_READY' },
        { phase: 2, title: 'Phase 2: Core Backend Engine, Frontend & Live API Demo', percentage: 40, amount: p2, status: 'PENDING' },
        { phase: 3, title: 'Phase 3: Source Code Handover, Deployment & IEEE Documentation', percentage: 30, amount: p3, status: 'PENDING' },
      ],
      createdAt: new Date(),
    };

    // 1. Save to MongoDB Atlas if connected
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

    // 3. Dispatch Email Notification asynchronously
    dispatchTeamNotificationEmail(newInquiry);

    return res.status(201).json({
      success: true,
      message: type === 'CALLBACK_REQUEST'
        ? 'Callback request dispatched! A ProjectXia Lead Software Developer will contact you shortly.'
        : 'Your custom software idea has been received and assigned directly to the ProjectXia Developing Team!',
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
