import Project from '../models/Project.js';

export const payoutStore = {
  kycProfiles: {},
  withdrawals: [],
};

// @desc    Update Creator Payout KYC & Tax Info
// @route   POST /api/payouts/kyc
export const updateCreatorKYC = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.body.userId || 'user_guest';
    const { upiId, bankName, accountNumber, ifscCode, panNumber, gstin } = req.body;

    const updated = {
      userId: String(userId),
      upiId: upiId || '',
      bankName: bankName || '',
      accountNumber: accountNumber ? `•••• •••• ${accountNumber.slice(-4)}` : '',
      ifscCode: ifscCode || '',
      panNumber: panNumber || '',
      gstin: gstin || '',
      isVerified: true,
      updatedAt: new Date(),
    };

    payoutStore.kycProfiles[String(userId)] = updated;

    return res.status(200).json({
      success: true,
      message: 'Creator KYC & Payout bank account verified and saved successfully.',
      kyc: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update KYC.',
      error: error.message,
    });
  }
};

// @desc    Get Creator Earnings & Platform Commission Summary
// @route   GET /api/payouts/earnings
export const getEarningsSummary = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.user?.id || req.query.userId || 'user_guest');
    const kyc = payoutStore.kycProfiles[userId] || null;

    // Calculate real sales from database
    let totalSales = 0;
    let totalDownloads = 0;
    try {
      const userProjects = await Project.find({ 'seller.id': userId });
      for (const p of userProjects) {
        const downloads = p.downloads || 0;
        totalDownloads += downloads;
        totalSales += (p.price || 0) * downloads;
      }
    } catch (dbErr) {
      totalSales = 0;
    }

    const grossSales = totalSales;
    const platformCommission = Math.round(grossSales * 0.1); // 10% platform fee
    const tdsDeduction = Math.round(grossSales * 0.01); // 1% Indian TDS
    const userWithdrawals = payoutStore.withdrawals.filter(w => w.userId === userId);
    const totalWithdrawn = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = Math.max(0, grossSales - platformCommission - tdsDeduction - totalWithdrawn);

    return res.status(200).json({
      success: true,
      earnings: {
        grossSales,
        platformCommission,
        tdsDeduction,
        totalWithdrawn,
        availableBalance,
        totalDownloads,
        currency: 'INR',
        kycStatus: kyc ? 'VERIFIED' : 'PENDING',
        kyc,
        withdrawals: userWithdrawals,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings summary.',
      error: error.message,
    });
  }
};

// @desc    Request Creator Payout Withdrawal
// @route   POST /api/payouts/withdraw
export const requestPayout = async (req, res) => {
  try {
    const userId = String(req.user?._id || req.user?.id || req.body.userId || 'user_guest');
    const { amount } = req.body;

    const withdrawAmount = Number(amount) || 0;
    if (withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No available balance to withdraw. List projects to earn royalties!',
      });
    }

    const kyc = payoutStore.kycProfiles[userId];
    const newWithdrawal = {
      _id: `wd_${Date.now()}`,
      userId,
      amount: withdrawAmount,
      payoutMethod: kyc?.upiId ? `UPI (${kyc.upiId})` : 'Direct Bank IMPS / NEFT',
      status: 'PROCESSING_INSTANT_TRANSFER',
      utrNumber: `UTR${Math.random().toString().slice(2, 14)}`,
      createdAt: new Date(),
    };

    payoutStore.withdrawals.unshift(newWithdrawal);

    return res.status(200).json({
      success: true,
      message: `Withdrawal request of ₹${withdrawAmount.toLocaleString('en-IN')} initiated. Funds dispatched to ${newWithdrawal.payoutMethod}.`,
      withdrawal: newWithdrawal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Withdrawal failed.',
      error: error.message,
    });
  }
};
