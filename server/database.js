const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Connection string from Supabase
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:admin123@db.sqysuuxscfmheejdrrld.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/Vercel
  }
});

let dbWrapper;

async function getDb() {
  if (!dbWrapper) {
    // Compatibility wrapper to avoid changing all route files
    dbWrapper = {
      async get(sql, params = []) {
        const res = await pool.query(sql.replace(/\?/g, (match, i) => `$${params.indexOf(params[i]) + 1}`), params);
        // Basic positional replacement for SQLite style params (?) to Postgres ($1, $2...)
        // Note: This is a simple replacement logic for common queries. 
        // For complex queries, we might need a more robust parser.
        let sqliteSql = sql;
        let pIndex = 1;
        while (sqliteSql.includes('?')) {
          sqliteSql = sqliteSql.replace('?', `$${pIndex++}`);
        }
        const result = await pool.query(sqliteSql, params);
        return result.rows[0];
      },
      async all(sql, params = []) {
        let sqliteSql = sql;
        let pIndex = 1;
        while (sqliteSql.includes('?')) {
          sqliteSql = sqliteSql.replace('?', `$${pIndex++}`);
        }
        const result = await pool.query(sqliteSql, params);
        return result.rows;
      },
      async run(sql, params = []) {
        let sqliteSql = sql;
        let pIndex = 1;
        while (sqliteSql.includes('?')) {
          sqliteSql = sqliteSql.replace('?', `$${pIndex++}`);
        }
        const result = await pool.query(sqliteSql, params);
        return { lastID: null, changes: result.rowCount };
      },
      async exec(sql) {
        return await pool.query(sql);
      }
    };
    await initSchema();
  }
  return dbWrapper;
}

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      two_factor_secret TEXT,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '💳',
      color TEXT DEFAULT '#6366f1',
      user_id INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('paid','pending')),
      due_date TEXT,
      payment_date TEXT,
      notes TEXT,
      tags TEXT,
      receipt_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS backups (
      id SERIAL PRIMARY KEY,
      label TEXT,
      year INTEGER,
      month INTEGER,
      data TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Check for 2FA columns (in case table already existed)
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;');
    console.log('✅ Checked/Added 2FA columns to users table');
  } catch (err) {
    console.error('Error adding 2FA columns:', err.message);
  }

  // Seed/Ensure default admin user
  const adminHash = await bcrypt.hash('jacobo2026', 10);
  await pool.query(`
    INSERT INTO users (username, password) 
    VALUES ($1, $2) 
    ON CONFLICT (username) 
    DO UPDATE SET password = $2
  `, ['admin', adminHash]);
  
  console.log('✅ Admin user ensured with password: jacobo2026');

  // Seed default categories if none exist
  const catCount = await pool.query('SELECT COUNT(*) as count FROM categories');
  if (parseInt(catCount.rows[0].count) === 0) {
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
      await pool.query(
        'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3)',
        [cat.name, cat.icon, cat.color]
      );
    }
    console.log('✅ Default categories seeded');
  }
}

module.exports = { getDb };
