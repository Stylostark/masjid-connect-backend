const { asyncHandler } = require('../middleware/errorHandler');
const donationModel = require('../models/donationModel');
const { createOrder, verifySignature } = require('../util/razorpay');

// POST /api/donations
const createDonation = asyncHandler(async (req, res) => {
  const { isAnonymous, donorName, donorPhone, donorAddress, amount } = req.body;
  const amt = parseFloat(amount);
  if (!amt || amt <= 0) {
    return res.status(400).json({ success: false, message: 'Enter a valid donation amount' });
  }
  if (!isAnonymous && !donorName) {
    return res.status(400).json({ success: false, message: 'Donor name is required unless donating anonymously' });
  }

  const donation = await donationModel.create({ isAnonymous, donorName, donorPhone, donorAddress, amount: amt });
  res.status(201).json({ success: true, donation });
});

// POST /api/donations/:id/pay
const payDonation = asyncHandler(async (req, res) => {
  const donation = await donationModel.findById(req.params.id);
  if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

  const order = await createOrder(donation.amount, `donation_${donation.id}`);
  res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
});

// POST /api/donations/:id/verify-payment
const verifyDonationPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const valid = verifySignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
  const donation = await donationModel.markPaid(req.params.id, razorpayPaymentId);
  res.json({ success: true, donation });
});

// GET /api/donations/total
const getTotal = asyncHandler(async (req, res) => {
  const total = await donationModel.totalCollected();
  res.json({ success: true, total });
});

// GET /api/donations (admin)
const listDonations = asyncHandler(async (req, res) => {
  const donations = await donationModel.listAll();
  res.json({ success: true, donations });
});

module.exports = { createDonation, payDonation, verifyDonationPayment, getTotal, listDonations };
