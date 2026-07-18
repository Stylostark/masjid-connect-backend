const pool = require('../config/db');

async function create({ isAnonymous, donorName, donorPhone, donorAddress, amount }) {
  const { rows } = await pool.query(
    `INSERT INTO donations (is_anonymous, donor_name, donor_phone, donor_address, amount)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [!!isAnonymous, isAnonymous ? null : donorName, isAnonymous ? null : donorPhone, isAnonymous ? null : donorAddress, amount]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM donations WHERE id = $1', [id]);
  return rows[0] || null;
}

async function markPaid(id, paymentRef) {
  const { rows } = await pool.query(
    `UPDATE donations SET payment_status = 'paid', payment_ref = $2 WHERE id = $1 RETURNING *`,
    [id, paymentRef]
  );
  return rows[0] || null;
}

async function totalCollected() {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM donations WHERE payment_status = 'paid'`
  );
  return parseFloat(rows[0].total);
}

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM donations ORDER BY created_at DESC');
  return rows;
}

module.exports = { create, findById, markPaid, totalCollected, listAll };
