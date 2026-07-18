const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// amount is in rupees; Razorpay expects paise.
async function createOrder(amountInRupees, receipt) {
  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: 'INR',
    receipt
  });
}

// Verifies the Razorpay payment signature returned by the Android checkout SDK.
function verifySignature({ orderId, paymentId, signature }) {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

module.exports = { razorpay, createOrder, verifySignature };
