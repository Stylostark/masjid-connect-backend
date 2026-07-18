const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/contentController');

// Announcements
router.get('/announcements', c.getAnnouncements);
router.get('/announcements/all', requireAuth, requireAdmin, c.getAllAnnouncements);
router.post('/announcements', requireAuth, requireAdmin, c.postAnnouncement);
router.patch('/announcements/:id', requireAuth, requireAdmin, c.patchAnnouncement);
router.delete('/announcements/:id', requireAuth, requireAdmin, c.removeAnnouncement);

// Namaz timings
router.get('/namaz-timings', c.getNamazTimings);
router.put('/namaz-timings', requireAuth, requireAdmin, c.putNamazTimings);

// Masjid info (address + map coordinates + developer credit)
router.get('/masjid-info', c.getMasjidInfo);
router.put('/masjid-info', requireAuth, requireAdmin, c.putMasjidInfo);

module.exports = router;
