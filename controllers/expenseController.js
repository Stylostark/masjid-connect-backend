const { asyncHandler } = require('../middleware/errorHandler');
const expenseModel = require('../models/expenseModel');
const donationModel = require('../models/donationModel');

// GET /api/expenses
const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseModel.listAll();
  res.json({ success: true, expenses });
});

// GET /api/expenses/balance  → donations_total - expenses_total
const getBalance = asyncHandler(async (req, res) => {
  const [donationsTotal, expensesTotal] = await Promise.all([
    donationModel.totalCollected(),
    expenseModel.totalSpent()
  ]);
  res.json({
    success: true,
    donationsTotal,
    expensesTotal,
    balance: donationsTotal - expensesTotal
  });
});

// POST /api/expenses (admin only)
const postExpense = asyncHandler(async (req, res) => {
  const { category, amount, description, receiptUrl, spentOn } = req.body;
  if (!category || !amount || !spentOn) {
    return res.status(400).json({ success: false, message: 'category, amount and spentOn are required' });
  }
  const expense = await expenseModel.create({
    category, amount: parseFloat(amount), description, receiptUrl, spentOn, addedBy: req.user.id
  });
  res.status(201).json({ success: true, expense });
});

// DELETE /api/expenses/:id (admin only)
const deleteExpense = asyncHandler(async (req, res) => {
  await expenseModel.remove(req.params.id);
  res.json({ success: true });
});

module.exports = { getExpenses, getBalance, postExpense, deleteExpense };
