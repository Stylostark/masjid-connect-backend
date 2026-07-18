const { asyncHandler } = require('../middleware/errorHandler');
const admissionModel = require('../models/admissionModel');
const { createOrder, verifySignature } = require('../util/razorpay');

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fixed admission fee — adjust as needed, or make configurable via masjid_info later.
const ADMISSION_FEE = 500;

// POST /api/admissions
const submitAdmission = asyncHandler(async (req, res) => {
  const { fatherName, motherName, mobileNumber, email, address, studentName, studentAge } = req.body;

  if (!fatherName || !motherName || !mobileNumber || !email || !address || !studentName || !studentAge) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (!PHONE_REGEX.test(mobileNumber)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address' });
  }

  const admission = await admissionModel.create({
    userId: req.user?.id || null,
    fatherName, motherName, mobileNumber, email, address, studentName,
    studentAge: parseInt(studentAge, 10),
    feeAmount: ADMISSION_FEE
  });

  res.status(201).json({ success: true, admission });
});

// POST /api/admissions/:id/pay  → creates Razorpay order
const createPaymentOrder = asyncHandler(async (req, res) => {
  const admission = await admissionModel.findById(req.params.id);
  if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
  if (admission.payment_status === 'paid') {
    return res.status(400).json({ success: false, message: 'This admission is already paid' });
  }

  const order = await createOrder(admission.fee_amount, `admission_${admission.id}`);
  res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
});

// POST /api/admissions/:id/verify-payment → verifies signature, generates token
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  const valid = verifySignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
  if (!valid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const admission = await admissionModel.markPaid(req.params.id, razorpayPaymentId);
  res.json({ success: true, admission });
});

// GET /api/admissions/my
const myAdmissions = asyncHandler(async (req, res) => {
  const admissions = await admissionModel.listByUser(req.user.id);
  res.json({ success: true, admissions });
});

// GET /api/admissions (admin)
const listAdmissions = asyncHandler(async (req, res) => {
  const admissions = await admissionModel.listAll(req.query.status);
  res.json({ success: true, admissions });
});

// PATCH /api/admissions/:id (admin — accept/reject + note)
const reviewAdmission = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  if (status && !['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  const admission = await admissionModel.updateStatus(req.params.id, { status, adminNote });
  if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
  res.json({ success: true, admission });
});

module.exports = { submitAdmission, createPaymentOrder, verifyPayment, myAdmissions, listAdmissions, reviewAdmission };
