const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is missing in .env');
  process.exit(1);
}

// Support SSL connections (e.g., Supabase / Neon / Render)
const sslConfig = process.env.NODE_ENV === 'production' || connectionString.includes('supabase') || connectionString.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString,
  ssl: sslConfig
});

async function runMigration() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Connecting to PostgreSQL and executing schema.sql...');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log(' Migration successful! All 17 tables created/reset.');
  } catch (err) {
    console.error(' Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
