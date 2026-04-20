const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Explicit configuration for Supabase (Using Port 5432 for DDL permissions)
const poolConfig = {
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  port: 5432, // Port 5432 supports CREATE TABLE and other DDL operations
  user: 'postgres.sqysuuxacfmheejdrrld',
  password: 'ojsB02Mx3nnZyJvO',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Override with DATABASE_URL only if it exists and we are NOT forcing a fix
let pool;
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sqysuuxscfmheejdrrld')) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log('📡 [DB] Using explicit Pooler config for sa-east-1');
  pool = new Pool(poolConfig);
}

let dbWrapper;
let isInitializing = false;

async function getDb() {
  if (dbWrapper) return dbWrapper;
  
  if (isInitializing) {
    // Wait a bit if another request is already initializing
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (dbWrapper) return dbWrapper;
  }

  isInitializing = true;
  try {
    const db = {
      async query(sql, params = []) { return pool.query(sql, params); },
      async get(sql, params = []) {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
        return res.rows[0];
      },
      async all(sql, params = []) {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
        return res.rows;
      },
      async run(sql, params = []) {
        const res = await pool.query(sql.replace(/\?/g, (_, i) => `$${i + 1}`), params);
        return { changes: res.rowCount };
      }
    };

    await initSchema();
    dbWrapper = db;
    return dbWrapper;
  } finally {
    isInitializing = false;
  }
}

async function initSchema() {
  console.log('🏗️ [DB] Running diagnostics...');
  try {
    // Diagnostic query
    const diag = await pool.query('SELECT current_user as user, current_database() as db, current_schema() as schema');
    console.log('📡 [DB] Context:', diag.rows[0]);

    // Force create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        two_factor_secret TEXT,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Quick admin seed logic
    const adminCheck = await pool.query("SELECT id FROM public.users WHERE username = 'admin'");
    if (adminCheck.rows.length === 0) {
      const adminHash = await bcrypt.hash('jacobo2026', 10);
      await pool.query('INSERT INTO public.users (username, password) VALUES ($1, $2)', ['admin', adminHash]);
    }

    // Attempt other tables (less critical for login)
    await pool.query('CREATE TABLE IF NOT EXISTS public.categories (id SERIAL PRIMARY KEY, name TEXT, icon TEXT, color TEXT, user_id INTEGER);');
    await pool.query('CREATE TABLE IF NOT EXISTS public.transactions (id SERIAL PRIMARY KEY, year INTEGER, month INTEGER, amount REAL, status TEXT);');

    console.log('✅ DB Schema initialized');
  } catch (err) {
    console.error('❌ DB INIT ERROR:', err.message);
    throw new Error(`Error de Inicialización: ${err.message}`);
  }
}

module.exports = { getDb };
