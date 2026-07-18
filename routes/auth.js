const express = require('express');
const router = express.Router();
const { register, login, me, refresh } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', requireAuth, me);

module.exports = router;
