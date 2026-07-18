const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

router.get('/stats', requireAuth, requireAdmin, getStats);

module.exports = router;
