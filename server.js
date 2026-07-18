require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const admissionRoutes = require('./routes/admissions');
const donationRoutes = require('./routes/donations');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, status: 'ok', db: 'connected', developer: 'Stylo Stark' });
  } catch (err) {
    res.status(500).json({ success: false, status: 'error', db: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', contentRoutes);              // /announcements, /namaz-timings, /masjid-info
app.use('/api/admissions', admissionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Masjid Connect backend running on port ${PORT}`);
});
