const pool = require('../config/db');

async function create({ category, amount, description, receiptUrl, spentOn, addedBy }) {
  const { rows } = await pool.query(
    `INSERT INTO expenses (category, amount, description, receipt_url, spent_on, added_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [category, amount, description || null, receiptUrl || null, spentOn, addedBy]
  );
  return rows[0];
}

async function listAll() {
  const { rows } = await pool.query('SELECT * FROM expenses ORDER BY spent_on DESC, id DESC');
  return rows;
}

async function totalSpent() {
  const { rows } = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses');
  return parseFloat(rows[0].total);
}

async function remove(id) {
  await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
}

module.exports = { create, listAll, totalSpent, remove };
