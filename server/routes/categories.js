const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)',
      [name, icon || '📍', color || '#cccccc']
    );
    
    const newCategory = await db.get('SELECT * FROM categories WHERE id = ?', [result.lastID]);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Prevent deletion if transactions exist
    const hasTransactions = await db.get('SELECT id FROM transactions WHERE category_id = ? LIMIT 1', [id]);
    if (hasTransactions) {
      return res.status(400).json({ error: 'No se puede eliminar: Hay gastos vinculados a esta categoría.' });
    }

    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
