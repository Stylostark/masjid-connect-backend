const Razorpay = require('razorpay');

// Lazily created so the server can boot even before Razorpay keys are
// configured — only payment endpoints need them, not the whole app.
let razorpayInstance = null;

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error('Payments are not configured yet: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    err.status = 503;
    throw err;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

// amount is in rupees; Razorpay expects paise.
async function createOrder(amountInRupees, receipt) {
  return getRazorpay().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: 'INR',
    receipt
  });
}

// Verifies the Razorpay payment signature returned by the Android checkout SDK.
function verifySignature({ orderId, paymentId, signature }) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    const err = new Error('Payments are not configured yet: set RAZORPAY_KEY_SECRET.');
    err.status = 503;
    throw err;
  }
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

module.exports = { createOrder, verifySignature };
