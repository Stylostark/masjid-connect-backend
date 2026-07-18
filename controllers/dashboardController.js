const { asyncHandler } = require('../middleware/errorHandler');
const donationModel = require('../models/donationModel');
const expenseModel = require('../models/expenseModel');
const admissionModel = require('../models/admissionModel');

// GET /api/dashboard/stats (admin) — quick stats for the Admin Panel home page
const getStats = asyncHandler(async (req, res) => {
  const [donationsTotal, expensesTotal, pendingAdmissions] = await Promise.all([
    donationModel.totalCollected(),
    expenseModel.totalSpent(),
    admissionModel.listAll('pending')
  ]);
  res.json({
    success: true,
    stats: {
      totalDonations: donationsTotal,
      totalExpenses: expensesTotal,
      balance: donationsTotal - expensesTotal,
      pendingAdmissionsCount: pendingAdmissions.length
    }
  });
});

module.exports = { getStats };
