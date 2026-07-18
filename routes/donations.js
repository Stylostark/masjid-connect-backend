const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/donationController');

router.post('/', c.createDonation);
router.post('/:id/pay', c.payDonation);
router.post('/:id/verify-payment', c.verifyDonationPayment);
router.get('/total', c.getTotal);
router.get('/', requireAuth, requireAdmin, c.listDonations);

module.exports = router;
