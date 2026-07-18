const { asyncHandler } = require('../middleware/errorHandler');
const contentModel = require('../models/contentModel');
const { sendEmergencyPush } = require('../util/fcm');

// GET /api/announcements (public — active only)
const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await contentModel.listActiveAnnouncements();
  res.json({ success: true, announcements });
});

// GET /api/announcements/all (admin — includes inactive)
const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await contentModel.listAllAnnouncements();
  res.json({ success: true, announcements });
});

// POST /api/announcements (admin)
const postAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, imageUrl, isEmergency } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'title and message are required' });
  }
  const announcement = await contentModel.createAnnouncement({ title, message, imageUrl, isEmergency });

  // Phase 7: trigger FCM push when an emergency announcement is created
  if (announcement.is_emergency) {
    sendEmergencyPush(announcement).catch((e) => console.error('FCM push failed:', e.message));
  }

  res.status(201).json({ success: true, announcement });
});

// PATCH /api/announcements/:id (admin)
const patchAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await contentModel.updateAnnouncement(req.params.id, req.body);
  if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
  res.json({ success: true, announcement });
});

// DELETE /api/announcements/:id (admin)
const removeAnnouncement = asyncHandler(async (req, res) => {
  await contentModel.deleteAnnouncement(req.params.id);
  res.json({ success: true });
});

// GET /api/namaz-timings (public)
const getNamazTimings = asyncHandler(async (req, res) => {
  const timings = await contentModel.getNamazTimings();
  res.json({ success: true, timings });
});

// PUT /api/namaz-timings (admin)
const putNamazTimings = asyncHandler(async (req, res) => {
  const { fajr, zuhr, asr, maghrib, isha, jumma } = req.body;
  if (!fajr || !zuhr || !asr || !maghrib || !isha || !jumma) {
    return res.status(400).json({ success: false, message: 'All six timings (fajr, zuhr, asr, maghrib, isha, jumma) are required' });
  }
  const timings = await contentModel.upsertNamazTimings({ fajr, zuhr, asr, maghrib, isha, jumma });
  res.json({ success: true, timings });
});

// GET /api/masjid-info (public)
const getMasjidInfo = asyncHandler(async (req, res) => {
  const info = await contentModel.getMasjidInfo();
  res.json({ success: true, info, developer: 'Stylo Stark' });
});

// PUT /api/masjid-info (admin)
const putMasjidInfo = asyncHandler(async (req, res) => {
  const info = await contentModel.upsertMasjidInfo(req.body);
  res.json({ success: true, info });
});

module.exports = {
  getAnnouncements, getAllAnnouncements, postAnnouncement, patchAnnouncement, removeAnnouncement,
  getNamazTimings, putNamazTimings,
  getMasjidInfo, putMasjidInfo
};
