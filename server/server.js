require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./database');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const statsRoutes = require('./routes/stats');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;

// Note: Database is now PostgreSQL (Supabase)

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoryRoutes);

// Serve static client build (useful for Render / local production)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Initialize DB regardless of environment (needed for serverless too)
async function initDb() {
  try {
    await getDb();
    console.log('✅ PostgreSQL Database connected and initialized');
  } catch (err) {
    console.error('❌ Failed to initialize DB:', err);
  }
}

if (process.env.VERCEL) {
  // On Vercel: initialize DB once on cold start, then export app
  initDb();
}
 else {
  // Local / Render: start HTTP server normally
  initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
