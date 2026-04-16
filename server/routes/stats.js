const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/stats/summary
router.get('/summary', async (req, res) => {
  try {
    const { year, month } = req.query;
    const db = await getDb();

    const summary = await db.get(`
      SELECT 
        SUM(amount) as total_expenses,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending
      FROM transactions 
      WHERE year = ? AND month = ?
    `, [year, month]);

    // Trend: Compare with previous month
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const prevSummary = await db.get(`
      SELECT SUM(amount) as total_expenses
      FROM transactions 
      WHERE year = ? AND month = ?
    `, [prevYear, prevMonth]);

    const trend = prevSummary?.total_expenses > 0 
      ? ((summary.total_expenses - prevSummary.total_expenses) / prevSummary.total_expenses) * 100 
      : 0;

    res.json({
      ...summary,
      trend: trend.toFixed(2),
      prev_total: prevSummary?.total_expenses || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stats/history
router.get('/history', async (req, res) => {
  try {
    const db = await getDb();
    const history = await db.all(`
      SELECT year, month, SUM(amount) as total
      FROM transactions
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 12
    `);
    res.json(history.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/stats/categories
router.get('/categories', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Year and month required' });
    
    const db = await getDb();
    const categories = await db.all(`
      SELECT 
        c.id, c.name, c.icon, c.color, SUM(t.amount) as value
      FROM categories c
      JOIN transactions t ON c.id = t.category_id
      WHERE t.year = ? AND t.month = ? AND t.amount > 0
      GROUP BY c.id
      ORDER BY value DESC
    `, [year, month]);
    
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
