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

// Optimized for Vercel: Lightweight initialization
async function initSchema() {
  try {
    console.log('🏗️ [DB] Checking/Creating Schema...');
    // Create everything in few batches to avoid timeouts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        two_factor_secret TEXT,
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS public.categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT DEFAULT '💳',
        color TEXT DEFAULT '#6366f1',
        user_id INTEGER
      );
      CREATE TABLE IF NOT EXISTS public.transactions (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        category_id INTEGER,
        amount REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Quick check/seed for admin only if users is empty
    const usersCount = await pool.query('SELECT COUNT(*) FROM public.users');
    if (parseInt(usersCount.rows[0].count) === 0) {
      const adminHash = await bcrypt.hash('jacobo2026', 10);
      await pool.query('INSERT INTO public.users (username, password) VALUES ($1, $2)', ['admin', adminHash]);
      console.log('✅ Default admin seeded');
    }

    console.log('✅ DB Schema ready');
  } catch (err) {
    console.error('❌ DB Init failed:', err.message);
    // We don't throw here to avoid killing the process if tables already exist
  }
}

module.exports = { getDb };
