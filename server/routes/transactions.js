const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDb } = require('../database');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../data/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month required' });
    }

    const db = await getDb();
    
    // Check if records for this month exist. If not, auto-generate from previous month or default categories.
    const records = await db.all(`
      SELECT t.*, c.name, c.icon, c.color 
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.year = ? AND t.month = ?
    `, [year, month]);

    if (records.length === 0) {
      // Logic for auto-generation could go here or via a dedicated button.
      // For now, let's return empty and let the frontend trigger "Generate month".
      return res.json([]);
    }

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/transactions/generate
// Generates current month's entries based on the previous month's setup
router.post('/generate', async (req, res) => {
  try {
    const { year, month } = req.body;
    const db = await getDb();

    // Check if already exists
    const existing = await db.get('SELECT id FROM transactions WHERE year = ? AND month = ? LIMIT 1', [year, month]);
    if (existing) {
      return res.status(400).json({ error: 'Records for this month already exist' });
    }

    // Try to find previous month
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const prevRecords = await db.all('SELECT category_id, amount, notes, tags FROM transactions WHERE year = ? AND month = ?', [prevYear, prevMonth]);

    if (prevRecords.length > 0) {
      // Generate from previous
      for (const rec of prevRecords) {
        await db.run(`
          INSERT INTO transactions (year, month, category_id, amount, status, notes, tags)
          VALUES (?, ?, ?, ?, 'pending', ?, ?)
        `, [year, month, rec.category_id, rec.amount, rec.notes, rec.tags]);
      }
    } else {
      // Generate from default categories
      const categories = await db.all('SELECT id FROM categories');
      for (const cat of categories) {
        await db.run(`
          INSERT INTO transactions (year, month, category_id, amount, status)
          VALUES (?, ?, ?, 0, 'pending')
        `, [year, month, cat.id]);
      }
    }

    res.json({ message: 'Month generated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/transactions/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, status, payment_date, notes } = req.body;
    const db = await getDb();

    await db.run(`
      UPDATE transactions 
      SET amount = COALESCE(?, amount), 
          status = COALESCE(?, status), 
          payment_date = ?, 
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [amount, status, payment_date, notes, id]);

    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/transactions/:id/receipt
router.post('/:id/receipt', upload.single('receipt'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const receiptUrl = `/uploads/${req.file.filename}`;
    const db = await getDb();
    
    await db.run('UPDATE transactions SET receipt_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [receiptUrl, id]);

    res.json({ message: 'Receipt uploaded', receipt_url: receiptUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
