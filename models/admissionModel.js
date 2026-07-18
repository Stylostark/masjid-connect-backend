const pool = require('../config/db');

async function create({ userId, fatherName, motherName, mobileNumber, email, address, studentName, studentAge, feeAmount }) {
  const { rows } = await pool.query(
    `INSERT INTO admissions
       (user_id, father_name, mother_name, mobile_number, email, address, student_name, student_age, fee_amount)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [userId, fatherName, motherName, mobileNumber, email, address, studentName, studentAge, feeAmount || 0]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM admissions WHERE id = $1', [id]);
  return rows[0] || null;
}

async function setPaymentRef(id, paymentRef) {
  await pool.query('UPDATE admissions SET payment_ref = $2 WHERE id = $1', [id, paymentRef]);
}

// Generates the next sequential token DN-{YEAR}-{4digit} and marks payment as paid.
async function markPaid(id, paymentRef) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const year = new Date().getFullYear();
    const { rows: countRows } = await client.query(
      `SELECT COUNT(*) FROM admissions WHERE token_id LIKE $1`,
      [`DN-${year}-%`]
    );
    const nextSeq = String(parseInt(countRows[0].count, 10) + 1).padStart(4, '0');
    const tokenId = `DN-${year}-${nextSeq}`;

    const { rows } = await client.query(
      `UPDATE admissions SET payment_status = 'paid', payment_ref = $2, token_id = $3
       WHERE id = $1 RETURNING *`,
      [id, paymentRef, tokenId]
    );
    await client.query('COMMIT');
    return rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function listByUser(userId) {
  const { rows } = await pool.query('SELECT * FROM admissions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows;
}

async function listAll(statusFilter) {
  if (statusFilter) {
    const { rows } = await pool.query('SELECT * FROM admissions WHERE status = $1 ORDER BY created_at DESC', [statusFilter]);
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM admissions ORDER BY created_at DESC');
  return rows;
}

async function updateStatus(id, { status, adminNote }) {
  const { rows } = await pool.query(
    `UPDATE admissions SET status = COALESCE($2, status), admin_note = COALESCE($3, admin_note)
     WHERE id = $1 RETURNING *`,
    [id, status, adminNote]
  );
  return rows[0] || null;
}

module.exports = { create, findById, setPaymentRef, markPaid, listByUser, listAll, updateStatus };
