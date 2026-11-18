const fs = require('fs');
const path = require('path');
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

// Helper to format names nicely: 'AANVI SHARMA' -> 'Aanvi Sharma'
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Generate username slug: 'AANVI SHARMA' -> 'aanvi.sharma'
function toUsernameSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

async function seedStudentsAndTimetable() {
  const client = await pool.connect();

  try {
    console.log('Starting B.Tech 5th Semester Students, Faculty & Timetable Courses Seed...');
    await client.query('BEGIN');

    // 1. Missing Faculty to add to Department 1 (Computer Science)
    const newFacultyList = [
      {
        fullName: 'Dr. Divyaneet',
        username: 'divyaneet',
        email: 'divyaneet@sau.int',
        deptId: 1
      },
      {
        fullName: 'Mr. Uttam Kumar Roy',
        username: 'uttam.roy',
        email: 'uttamroy@sau.int',
        deptId: 1
      }
    ];

    const facultyPasswordHash = await bcrypt.hash('Sau@2026', 10);
    const studentPasswordHash = await bcrypt.hash('Sau@2026', 10);

    for (const fac of newFacultyList) {
      // Check if user already exists
      const userRes = await client.query(
        `SELECT user_id FROM users WHERE username = $1 OR email = $2`,
        [fac.username, fac.email]
      );

      let userId;
      if (userRes.rows.length === 0) {
        const insertUser = await client.query(
          `INSERT INTO users (username, password_hash, role, full_name, email, is_active)
           VALUES ($1, $2, 'Faculty', $3, $4, true)
           RETURNING user_id`,
          [fac.username, facultyPasswordHash, fac.fullName, fac.email]
        );
        userId = insertUser.rows[0].user_id;
        console.log(`Created user account for faculty: ${fac.fullName} (${fac.username})`);
      } else {
        userId = userRes.rows[0].user_id;
        console.log(`Faculty user already exists: ${fac.fullName}`);
      }

      // Check if faculty record exists
      const facRes = await client.query(
        `SELECT faculty_id FROM faculty WHERE user_id = $1`,
        [userId]
      );
      if (facRes.rows.length === 0) {
        await client.query(
          `INSERT INTO faculty (user_id, department_id) VALUES ($1, $2)`,
          [userId, fac.deptId]
        );
        console.log(`Assigned faculty record to Dept ${fac.deptId} for: ${fac.fullName}`);
      }
    }

    // 2. Insert Timetable Courses
    const coursesToSeed = [
      {
        code: 'CS301',
        name: 'Advanced Data Structure and Algorithms',
        deptId: 1,
        facultyMatch: 'Bijoy Chand Chatterjee'
      },
      {
        code: 'CS302',
        name: 'Neural Networks and Deep Learning',
        deptId: 1,
        facultyMatch: 'Sandeep Kumar'
      },
      {
        code: 'CS303',
        name: 'AI and Soft Computing',
        deptId: 1,
        facultyMatch: 'Tamalika Chaira'
      },
      {
        code: 'CS304',
        name: 'Full Stack Development (using Web Technologies)',
        deptId: 1,
        facultyMatch: 'Anurag Tiwari'
      },
      {
        code: 'CS305',
        name: 'Logical Aptitude and Reasoning Skills',
        deptId: 1,
        facultyMatch: 'Divyaneet'
      },
      {
        code: 'CS306',
        name: 'Efficient and Competitive Programming',
        deptId: 1,
        facultyMatch: 'Uttam Kumar Roy'
      },
      {
        code: 'CS307',
        name: 'Software Engineering',
        deptId: 1,
        facultyMatch: 'Taniya Seth'
      },
      {
        code: 'CS308',
        name: 'Case Study V',
        deptId: 1,
        facultyMatch: 'Reshma Rastogi'
      },
      {
        code: 'CS309',
        name: 'CRT Program (Campus Recruitment Training)',
        deptId: 1,
        facultyMatch: 'Divyaneet'
      }
    ];

    const seededCourseIds = [];

    for (const c of coursesToSeed) {
      // Upsert or insert course
      let courseRes = await client.query(
        `SELECT course_id FROM courses WHERE code = $1`,
        [c.code]
      );

      let courseId;
      if (courseRes.rows.length === 0) {
        const insertC = await client.query(
          `INSERT INTO courses (code, name, department_id)
           VALUES ($1, $2, $3)
           RETURNING course_id`,
          [c.code, c.name, c.deptId]
        );
        courseId = insertC.rows[0].course_id;
        console.log(`Created course: ${c.code} - ${c.name}`);
      } else {
        courseId = courseRes.rows[0].course_id;
        console.log(`Course exists: ${c.code} - ${c.name}`);
      }
      seededCourseIds.push(courseId);

      // Find faculty ID
      const facQuery = await client.query(
        `SELECT f.faculty_id, u.full_name
         FROM faculty f
         JOIN users u ON f.user_id = u.user_id
         WHERE u.full_name ILIKE $1`,
        [`%${c.facultyMatch}%`]
      );

      if (facQuery.rows.length > 0) {
        const facId = facQuery.rows[0].faculty_id;
        // Link course to faculty in course_faculty
        await client.query(
          `INSERT INTO course_faculty (course_id, faculty_id)
           VALUES ($1, $2)
           ON CONFLICT (course_id, faculty_id) DO NOTHING`,
          [courseId, facId]
        );
        console.log(`Mapped ${c.code} -> Prof. ${facQuery.rows[0].full_name}`);
      } else {
        console.warn(`WARNING: Could not find faculty matching '${c.facultyMatch}' for ${c.code}`);
      }
    }

    // 3. Parse Students from Room Seating (All 104 students: B.Tech and DM.Tech)
    const { execSync } = require('child_process');
    const pdfPath = path.join(__dirname, '../../.local/Room Seating - 24b.pdf');
    let content = '';

    if (fs.existsSync('/tmp/all_room_seating.txt')) {
      content = fs.readFileSync('/tmp/all_room_seating.txt', 'utf8');
    } else if (fs.existsSync(pdfPath)) {
      content = execSync(`pdftotext "${pdfPath}" -`, { encoding: 'utf8' });
    } else if (fs.existsSync('/tmp/room_seating.txt')) {
      content = fs.readFileSync('/tmp/room_seating.txt', 'utf8');
    }

    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedStudents = [];

    for (let sl = 1; sl <= 104; sl++) {
      const slIdx = lines.findIndex((l, idx) => l === String(sl) && idx >= 4);
      if (slIdx !== -1) {
        let j = slIdx + 1;
        let name = '';
        let enrollment = '';
        let room = '';

        while (j < lines.length && !/^\d+$/.test(lines[j])) {
          const line = lines[j];
          const enrMatch = line.match(/(SAU\/CS\/(?:BTECH|DMTECH)\(CSE\)\/2024\/\d+)/);
          if (enrMatch) {
            enrollment = enrMatch[1];
            const before = line.replace(enrMatch[1], '').trim();
            if (before && !name) {
              name = before;
            }
          } else if (line.startsWith('CSE')) {
            room = line;
          } else if (!line.includes('Rooms Allocation') && !line.includes('Sl No.') && !line.includes('Enrollment') && !line.includes('Room No.')) {
            if (!name) name = line;
            else if (!enrollment) name += ' ' + line;
          }
          j++;
        }

        if (name && enrollment) {
          parsedStudents.push({
            sl,
            rawName: name,
            titleName: toTitleCase(name),
            username: toUsernameSlug(name),
            enrollment,
            examRoom: room
          });
        }
      }
    }

    console.log(`Parsed all ${parsedStudents.length} students (B.Tech & Dual Degree M.Tech).`);

    let createdStudentsCount = 0;
    let enrolledRecordsCount = 0;

    for (const s of parsedStudents) {
      const email = `${s.username}@students.sau.int`;

      // 3.1 Check/insert user
      let userRes = await client.query(
        `SELECT user_id FROM users WHERE username = $1 OR email = $2`,
        [s.username, email]
      );

      let userId;
      if (userRes.rows.length === 0) {
        const insU = await client.query(
          `INSERT INTO users (username, password_hash, role, full_name, email, is_active)
           VALUES ($1, $2, 'Student', $3, $4, true)
           RETURNING user_id`,
          [s.username, studentPasswordHash, s.titleName, email]
        );
        userId = insU.rows[0].user_id;
        createdStudentsCount++;
      } else {
        userId = userRes.rows[0].user_id;
      }

      // 3.2 Check/insert student profile
      let studRes = await client.query(
        `SELECT student_id FROM students WHERE enrollment_id = $1 OR user_id = $2`,
        [s.enrollment, userId]
      );

      let studentId;
      if (studRes.rows.length === 0) {
        const insS = await client.query(
          `INSERT INTO students (user_id, enrollment_id, custom_hostel_id)
           VALUES ($1, $2, NULL)
           RETURNING student_id`,
          [userId, s.enrollment]
        );
        studentId = insS.rows[0].student_id;
      } else {
        studentId = studRes.rows[0].student_id;
      }

      // 3.3 Enroll student in all 9 semester courses
      for (const courseId of seededCourseIds) {
        const enrollRes = await client.query(
          `INSERT INTO enrollments (course_id, student_id)
           VALUES ($1, $2)
           ON CONFLICT (course_id, student_id) DO NOTHING
           RETURNING *`,
          [courseId, studentId]
        );
        if (enrollRes.rows.length > 0) {
          enrolledRecordsCount++;
        }
      }
    }

    await client.query('COMMIT');

    console.log('\n================ SEED SUMMARY ================');
    console.log(`Total students parsed & processed: ${parsedStudents.length}`);
    console.log(`New user accounts created: ${createdStudentsCount}`);
    console.log(`Timetable courses seeded: ${coursesToSeed.length}`);
    console.log(`Total course enrollments created: ${enrolledRecordsCount}`);
    console.log('Default credentials for students:');
    console.log('  Username: <firstname.lastname> (e.g. aanvi.sharma, aastha.bahuguna)');
    console.log('  Enrollment ID: e.g. SAU/CS/BTECH(CSE)/2024/01');
    console.log('  Password: Sau@2026');
    console.log('==============================================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed transaction failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedStudentsAndTimetable();
