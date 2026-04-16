// Vercel Serverless Function entry point
// This file imports the Express app and exports it for Vercel

// IMPORTANT: SQLite on Vercel uses a temp filesystem.
// Data will NOT persist between deployments/requests.
// Migrate to a remote database (e.g. Supabase/Neon) for production use.

module.exports = require('../server/server.js');
