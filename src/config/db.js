const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

const sslConfig =
  process.env.NODE_ENV === 'production' ||
  (connectionString && (connectionString.includes('supabase') || connectionString.includes('sslmode=require')))
    ? { rejectUnauthorized: false }
    : false;

const pool = new Pool({
  connectionString,
  ssl: sslConfig
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
