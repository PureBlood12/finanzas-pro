const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

let db;

async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'data', 'finanzas.sqlite'),
      driver: sqlite3.Database,
    });
    await initSchema();
  }
  return db;
}

async function initSchema() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '💳',
      color TEXT DEFAULT '#6366f1',
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('paid','pending')),
      due_date TEXT,
      payment_date TEXT,
      notes TEXT,
      tags TEXT,
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS backups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT,
      year INTEGER,
      month INTEGER,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Silent alter table for existing DBs
  try {
    await db.exec(`ALTER TABLE transactions ADD COLUMN receipt_url TEXT;`);
    console.log('✅ Added receipt_url column to existing schema');
  } catch (err) {
    // Column might already exist, ignore safely
  }

  // Seed default users if none exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const hash1 = await bcrypt.hash('admin123', 10);
    const hash2 = await bcrypt.hash('user123', 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash1]);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['usuario', hash2]);
    console.log('✅ Default users created: admin/admin123 and usuario/user123');
  }

  // Seed default categories
  const catCount = await db.get('SELECT COUNT(*) as count FROM categories');
  if (catCount.count === 0) {
    const defaultCategories = [
      { name: 'Luz (Edesa)', icon: '💡', color: '#f59e0b' },
      { name: 'Cochera', icon: '🚗', color: '#3b82f6' },
      { name: 'Alquiler', icon: '🏠', color: '#8b5cf6' },
      { name: 'Expensas', icon: '🏢', color: '#06b6d4' },
      { name: 'Internet', icon: '🌐', color: '#10b981' },
      { name: 'Gas', icon: '🔥', color: '#f97316' },
      { name: 'Seguro Auto', icon: '🛡️', color: '#ec4899' },
    ];
    for (const cat of defaultCategories) {
      await db.run(
        'INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)',
        [cat.name, cat.icon, cat.color]
      );
    }
    console.log('✅ Default categories seeded');
  }
}

module.exports = { getDb };
