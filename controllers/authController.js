const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');
const userModel = require('../models/userModel');

const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile numbers, 10 digits, no +91 stored

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
  );
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, phone, password, email } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, message: 'name, phone and password are required' });
  }
  if (!PHONE_REGEX.test(phone)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const existing = await userModel.findByPhone(phone);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this phone number already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({ name, phone, email, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({ success: true, user, accessToken, refreshToken });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'phone and password are required' });
  }

  const user = await userModel.findByPhone(phone);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  delete user.password_hash;

  res.json({ success: true, user, accessToken, refreshToken });
});

// GET /api/auth/me  (protected)
const me = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'refreshToken is required' });
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await userModel.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    const accessToken = signAccessToken(user);
    res.json({ success: true, accessToken });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
});

module.exports = { register, login, me, refresh };
