import crypto from 'crypto';
import AgencyLead from '../models/AgencyLead.js';
import { sendAgencyInquiryEmail, sendClientInquiryConfirmation } from '../services/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

export const agencyStore = {
  inquiries: [],
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

    // Standard Server-Side Validation
    const trimmedName = String(clientName || '').trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your full name.',
      });
    }

    // Validate Phone Number
    const rawPhone = String(clientMobile || '').replace(/[^0-9]/g, '');
    if (!rawPhone || rawPhone.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.',
      });
    }

    // Validate Email Address
    const trimmedEmail = String(clientEmail || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
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

    // 3. Dispatch Live High-Priority Email Notification to theprojectxia@gmail.com
    await sendAgencyInquiryEmail({ leadData: newInquiry });

    // 4. Dispatch Confirmation Email to Client
    sendClientInquiryConfirmation({ leadData: newInquiry }).catch(() => {});

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
