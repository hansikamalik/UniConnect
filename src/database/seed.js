const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is missing in .env');
  process.exit(1);
}

const sslConfig = process.env.NODE_ENV === 'production' || connectionString.includes('supabase') || connectionString.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : false;

const pool = new Pool({
  connectionString,
  ssl: sslConfig
});

async function runSeed() {
  const seedPath = path.join(__dirname, 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');

  console.log('Connecting to PostgreSQL and executing seed.sql...');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log(' Seeding successful! Departments, hostels, meal slots, grade scales, and admin user created.');
  } catch (err) {
    console.error(' Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
