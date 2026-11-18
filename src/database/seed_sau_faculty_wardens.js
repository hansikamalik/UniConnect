const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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

// Official SAU Data compiled from sau.int
const WARDENS = [
  {
    username: 'amit.shukla',
    fullName: 'Dr. Amit Kumar Shukla',
    email: 'amitkshukla@sau.int',
    hostelCode: 'BH1', // Boys Hostel 1
    departmentId: 1    // CSE
  },
  {
    username: 'balram.raut',
    fullName: 'Dr. Balram Prasad Raut',
    email: 'balram.raut@sau.int',
    hostelCode: 'BH2', // Boys Hostel 2
    departmentId: 6    // Legal Studies
  },
  {
    username: 'shyamli.singh',
    fullName: 'Dr. Shyamli Singh',
    email: 'shyamli.singh@sau.int',
    hostelCode: 'GH1', // Girls Hostel 1
    departmentId: 3    // Climate / Biotech
  },
  {
    username: 'kajori.bhatnagar',
    fullName: 'Dr. Kajori Bhatnagar',
    email: 'kajori.bhatnagar@sau.int',
    hostelCode: 'GH2', // Girls Hostel 2
    departmentId: 6    // Legal Studies
  }
];

const FACULTY = [
  // Computer Science & Engineering (Department ID: 1)
  { username: 'pranab.muhuri', fullName: 'Prof. Pranab Kumar Muhuri', email: 'pranabmuhuri@cs.sau.ac.in', deptId: 1 },
  { username: 'muhammad.abulaish', fullName: 'Prof. Muhammad Abulaish', email: 'abulaish@cs.sau.ac.in', deptId: 1 },
  { username: 'kavita.khanna', fullName: 'Prof. Kavita Khanna', email: 'kavitakhanna@sau.int', deptId: 1 },
  { username: 'reshma.rastogi', fullName: 'Dr. Reshma Rastogi', email: 'reshma.khemchandani@cs.sau.ac.in', deptId: 1 },
  { username: 'amit.banerjee', fullName: 'Dr. Amit Banerjee', email: 'amit@cs.sau.ac.in', deptId: 1 },
  { username: 'shachi.sharma', fullName: 'Dr. Shachi Sharma', email: 'shachi@sau.int', deptId: 1 },
  { username: 'bijoy.chatterjee', fullName: 'Dr. Bijoy Chand Chatterjee', email: 'bijoycc@sau.int', deptId: 1 },
  { username: 'tamalika.chaira', fullName: 'Dr. Tamalika Chaira', email: 'tamalikachaira@sau.int', deptId: 1 },
  { username: 'sandeep.kumar', fullName: 'Dr. Sandeep Kumar', email: 'sandeepkumar@sau.int', deptId: 1 },
  { username: 'anurag.tiwari', fullName: 'Dr. Anurag Tiwari', email: 'anuragtiwari@sau.int', deptId: 1 },
  { username: 'ankit.jain', fullName: 'Dr. Ankit Jain', email: 'ankit.jain@sau.int', deptId: 1 },

  // Mathematics (Department ID: 2)
  { username: 'deepa.sinha', fullName: 'Prof. Deepa Sinha (Dean & Proctor)', email: 'deepasinha@sau.ac.in', deptId: 2 },
  { username: 'pankaj.jain', fullName: 'Prof. Pankaj Jain', email: 'pankaj.jain@sau.ac.in', deptId: 2 },
  { username: 'navnit.jha', fullName: 'Prof. Navnit Jha (Dean of Students)', email: 'navnitjha@sau.ac.in', deptId: 2 },
  { username: 'jagdish.bansal', fullName: 'Prof. Jagdish Chand Bansal', email: 'jcbansal@sau.ac.in', deptId: 2 },
  { username: 'saroj.sahani', fullName: 'Dr. Saroj Kumar Sahani', email: 'sarojkumar@sau.ac.in', deptId: 2 },
  { username: 'swati.mishra', fullName: 'Dr. Swati Mishra', email: 'swati93@sau.int', deptId: 2 },

  // Legal Studies (Department ID: 6)
  { username: 'ritu.gupta', fullName: 'Prof. Ritu Gupta (Dean FLS)', email: 'ritu.gupta@sau.int', deptId: 6 },
  { username: 'ravindra.pratap', fullName: 'Prof. Ravindra Pratap', email: 'ravindrapratap@sau.int', deptId: 6 },
  { username: 'stellina.jolly', fullName: 'Dr. Stellina Jolly', email: 'stellinajolly@sau.ac.in', deptId: 6 },
  { username: 'srinivas.burra', fullName: 'Dr. Srinivas Burra', email: 'srinivasb@sau.ac.in', deptId: 6 },
  { username: 'nafees.ahmad', fullName: 'Dr. Nafees Ahmad', email: 'drnafeesahmad@sau.ac.in', deptId: 6 },

  // Economics (Department ID: 4)
  { username: 'arup.mitra', fullName: 'Prof. Arup Mitra', email: 'arupmitra@sau.int', deptId: 4 },
  { username: 'binoy.goswami', fullName: 'Dr. Binoy Goswami', email: 'binoygoswami@sau.ac.in', deptId: 4 },
  { username: 'debdatta.saha', fullName: 'Dr. Debdatta Saha', email: 'debdatta@sau.ac.in', deptId: 4 },
  { username: 'manasi.bera', fullName: 'Dr. Manasi Bera', email: 'manasi@sau.int', deptId: 4 }
];

async function seedSAUData() {
  const client = await pool.connect();

  try {
    console.log('Seeding official South Asian University Faculty & Wardens from sau.int...');
    await client.query('BEGIN');

    // Default password for all faculty/wardens: Sau@2026
    const passwordHash = await bcrypt.hash('Sau@2026', 10);

    // 1. Seed Wardens
    for (const w of WARDENS) {
      const userRes = await client.query(
        `INSERT INTO users (username, password_hash, role, full_name, email, is_active, created_at)
         VALUES ($1, $2, 'Warden', $3, $4, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (username) DO UPDATE
           SET full_name = EXCLUDED.full_name,
               email = EXCLUDED.email
         RETURNING user_id`,
        [w.username, passwordHash, w.fullName, w.email]
      );

      const userId = userRes.rows[0].user_id;

      // Assign warden to their respective hostel
      await client.query(
        `UPDATE hostels SET warden_user_id = $1 WHERE code = $2`,
        [userId, w.hostelCode]
      );
      console.log(` Assigned Warden: ${w.fullName} -> Hostel ${w.hostelCode}`);
    }

    // 2. Seed Faculty
    for (const f of FACULTY) {
      const userRes = await client.query(
        `INSERT INTO users (username, password_hash, role, full_name, email, is_active, created_at)
         VALUES ($1, $2, 'Faculty', $3, $4, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (username) DO UPDATE
           SET full_name = EXCLUDED.full_name,
               email = EXCLUDED.email
         RETURNING user_id`,
        [f.username, passwordHash, f.fullName, f.email]
      );

      const userId = userRes.rows[0].user_id;

      // Ensure faculty profile exists
      await client.query(
        `INSERT INTO faculty (user_id, department_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE
           SET department_id = EXCLUDED.department_id`,
        [userId, f.deptId]
      );
    }
    console.log(` Inserted ${FACULTY.length} Faculty members across Computer Science, Mathematics, Law, and Economics.`);

    await client.query('COMMIT');
    console.log('\n Successfully seeded all SAU Faculty & Wardens into database!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding SAU faculty and wardens:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedSAUData();
