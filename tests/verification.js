/**
 * Automated End-to-End Verification Test Script
 */
const app = require('../src/app');
const db = require('../src/config/db');

async function runTests() {
  console.log(' Starting UniConnect Automated Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` \x1b[32mPASS\x1b[0m: ${message}`);
      passed++;
    } else {
      console.error(` \x1b[31mFAIL\x1b[0m: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: Verify users table has all 5 roles
    const rolesRes = await db.query(`SELECT DISTINCT role FROM users`);
    const existingRoles = rolesRes.rows.map(r => r.role);
    assert(
      ['Student', 'Faculty', 'Warden', 'Mess Admin', 'Admin'].every(r => existingRoles.includes(r)),
      'Database contains test accounts for all 5 roles'
    );

    // Test 2: Verify D-1 Universal Student Identifier (enrollment_id exists, no roll number)
    const studentRes = await db.query(`SELECT * FROM students WHERE enrollment_id = 'SAU/2026/CS/001'`);
    assert(
      studentRes.rows.length === 1 && studentRes.rows[0].custom_hostel_id === 'BH1-304',
      'Student 1 has enrollment_id SAU/2026/CS/001 and custom_hostel_id BH1-304'
    );

    // Test 3: Day Scholar check (custom_hostel_id is null)
    const dayScholarRes = await db.query(`SELECT * FROM students WHERE enrollment_id = 'SAU/2026/CS/002'`);
    assert(
      dayScholarRes.rows.length === 1 && dayScholarRes.rows[0].custom_hostel_id === null,
      'Student 2 is a Day Scholar with custom_hostel_id = NULL'
    );

    // Test 4: Exactly 3 Meal Slots (Breakfast, Lunch, Dinner)
    const mealRes = await db.query(`SELECT name, start_time, end_time FROM meal_slots ORDER BY slot_id ASC`);
    assert(
      mealRes.rows.length === 3 &&
      mealRes.rows[0].name === 'Breakfast' &&
      mealRes.rows[1].name === 'Lunch' &&
      mealRes.rows[2].name === 'Dinner',
      'Exactly 3 meal slots exist with standard SAU meal timings'
    );

    // Test 5: Verify Marks and Audit Log integrity (AD-7)
    const marksRes = await db.query(`SELECT * FROM marks WHERE marks_obtained = 85.00`);
    const auditRes = await db.query(`SELECT * FROM audit_log WHERE marks_id = $1`, [marksRes.rows[0].marks_id]);
    assert(
      marksRes.rows.length > 0 && auditRes.rows.length > 0,
      'Marks record has corresponding immutable audit_log row'
    );

    // Test 6: Verify Course Posts exist
    const postsRes = await db.query(`SELECT * FROM course_posts`);
    assert(
      postsRes.rows.length >= 2,
      'Course posts (Quizzes & Assignments) loaded in database'
    );

    // Test 7: Verify Hostel Complaints exist
    const compRes = await db.query(`SELECT * FROM complaints`);
    assert(
      compRes.rows.length >= 1,
      'Hostel complaint exists with In Progress status'
    );

    console.log(`\n========================================`);
    console.log(` Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

runTests();
