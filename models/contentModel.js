const pool = require('../config/db');

// --- Announcements ---
async function listActiveAnnouncements() {
  const { rows } = await pool.query(
    `SELECT * FROM announcements WHERE is_active = true
     ORDER BY is_emergency DESC, created_at DESC`
  );
  return rows;
}

async function listAllAnnouncements() {
  const { rows } = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  return rows;
}

async function createAnnouncement({ title, message, imageUrl, isEmergency }) {
  const { rows } = await pool.query(
    `INSERT INTO announcements (title, message, image_url, is_emergency)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, message, imageUrl || null, !!isEmergency]
  );
  return rows[0];
}

async function updateAnnouncement(id, { title, message, imageUrl, isEmergency, isActive }) {
  const { rows } = await pool.query(
    `UPDATE announcements SET
       title = COALESCE($2, title),
       message = COALESCE($3, message),
       image_url = COALESCE($4, image_url),
       is_emergency = COALESCE($5, is_emergency),
       is_active = COALESCE($6, is_active)
     WHERE id = $1 RETURNING *`,
    [id, title, message, imageUrl, isEmergency, isActive]
  );
  return rows[0] || null;
}

async function deleteAnnouncement(id) {
  await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
}

// --- Namaz Timings (single current row, id=1 convention) ---
async function getNamazTimings() {
  const { rows } = await pool.query('SELECT * FROM namaz_timings ORDER BY id DESC LIMIT 1');
  return rows[0] || null;
}

async function upsertNamazTimings({ fajr, zuhr, asr, maghrib, isha, jumma }) {
  const existing = await getNamazTimings();
  if (existing) {
    const { rows } = await pool.query(
      `UPDATE namaz_timings SET fajr=$2, zuhr=$3, asr=$4, maghrib=$5, isha=$6, jumma=$7, updated_at=NOW()
       WHERE id = $1 RETURNING *`,
      [existing.id, fajr, zuhr, asr, maghrib, isha, jumma]
    );
    return rows[0];
  }
  const { rows } = await pool.query(
    `INSERT INTO namaz_timings (fajr, zuhr, asr, maghrib, isha, jumma)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [fajr, zuhr, asr, maghrib, isha, jumma]
  );
  return rows[0];
}

// --- Masjid Info (single row, id=1 convention) ---
async function getMasjidInfo() {
  const { rows } = await pool.query('SELECT * FROM masjid_info ORDER BY id DESC LIMIT 1');
  return rows[0] || null;
}

async function upsertMasjidInfo({ name, address, contactNumber, latitude, longitude }) {
  const existing = await getMasjidInfo();
  if (existing) {
    const { rows } = await pool.query(
      `UPDATE masjid_info SET
         name = COALESCE($2, name), address = COALESCE($3, address),
         contact_number = COALESCE($4, contact_number),
         latitude = COALESCE($5, latitude), longitude = COALESCE($6, longitude),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [existing.id, name, address, contactNumber, latitude, longitude]
    );
    return rows[0];
  }
  const { rows } = await pool.query(
    `INSERT INTO masjid_info (name, address, contact_number, latitude, longitude)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name || 'Doctor Para Jame Masjid', address, contactNumber, latitude, longitude]
  );
  return rows[0];
}

module.exports = {
  listActiveAnnouncements, listAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getNamazTimings, upsertNamazTimings,
  getMasjidInfo, upsertMasjidInfo
};
