const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/expenseController');

router.get('/', c.getExpenses);
router.get('/balance', c.getBalance);
router.post('/', requireAuth, requireAdmin, c.postExpense);
router.delete('/:id', requireAuth, requireAdmin, c.deleteExpense);

module.exports = router;
