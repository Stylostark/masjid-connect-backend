const pool = require('../config/db');

async function findByPhone(phone) {
  const { rows } = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, phone, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, phone, email, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, phone, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, phone, email, role, created_at`,
    [name, phone, email || null, passwordHash]
  );
  return rows[0];
}

module.exports = { findByPhone, findById, createUser };
