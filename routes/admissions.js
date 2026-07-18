const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/admissionController');

router.post('/', requireAuth, c.submitAdmission);
router.post('/:id/pay', requireAuth, c.createPaymentOrder);
router.post('/:id/verify-payment', requireAuth, c.verifyPayment);
router.get('/my', requireAuth, c.myAdmissions);
router.get('/', requireAuth, requireAdmin, c.listAdmissions);
router.patch('/:id', requireAuth, requireAdmin, c.reviewAdmission);

module.exports = router;
