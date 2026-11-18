const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('ERROR: DATABASE_URL missing in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' || connectionString.includes('supabase') || connectionString.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false
});

async function flushUsersExceptAdmin() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Flushing non-admin data and users...');

    await client.query('DELETE FROM audit_log');
    await client.query('DELETE FROM marks');
    await client.query('DELETE FROM course_posts');
    await client.query('DELETE FROM enrollments');
    await client.query('DELETE FROM course_faculty');
    await client.query('DELETE FROM complaints');
    await client.query('DELETE FROM mess_subscriptions');
    await client.query('UPDATE hostels SET warden_user_id = NULL');

    await client.query("DELETE FROM notices WHERE posted_by NOT IN (SELECT user_id FROM users WHERE username = 'admin')");
    await client.query("UPDATE menu_items SET posted_by = (SELECT user_id FROM users WHERE username = 'admin')");

    await client.query('DELETE FROM students');
    await client.query('DELETE FROM faculty');

    const res = await client.query("DELETE FROM users WHERE username != 'admin' RETURNING username");
    console.log(`Deleted ${res.rows.length} user(s):`, res.rows.map(r => r.username));

    await client.query('COMMIT');
    console.log(' All users flushed except admin.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to flush users:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

flushUsersExceptAdmin();
