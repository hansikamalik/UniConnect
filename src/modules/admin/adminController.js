const bcrypt = require('bcryptjs');
const db = require('../../config/db');

/**
 * Admin: List Users (filter by role)
 */
exports.getUsersList = async (req, res) => {
  const roleFilter = req.query.role || 'ALL';

  try {
    let queryText = `
      SELECT u.user_id, u.username, u.role, u.full_name, u.email, u.is_active, u.created_at,
             s.enrollment_id, s.custom_hostel_id,
             d.name AS department_name,
             h.name AS hostel_name
      FROM users u
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      LEFT JOIN departments d ON f.department_id = d.department_id
      LEFT JOIN hostels h ON h.warden_user_id = u.user_id`;
    let params = [];

    if (roleFilter !== 'ALL') {
      queryText += ` WHERE u.role = $1`;
      params.push(roleFilter);
    }

    queryText += ` ORDER BY u.created_at DESC`;

    const result = await db.query(queryText, params);

    res.render('admin/users', {
      title: 'User Management - UniConnect',
      users: result.rows,
      roleFilter,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.render('admin/users', {
      title: 'User Management - UniConnect',
      users: [],
      roleFilter,
      error: 'Failed to load users from database.',
      success: null
    });
  }
};

/**
 * Admin: Render Create User Page
 */
exports.getCreateUserPage = async (req, res) => {
  try {
    const depts = await db.query(`SELECT department_id, name FROM departments ORDER BY name ASC`);
    const hostels = await db.query(`SELECT hostel_id, name, code FROM hostels ORDER BY name ASC`);

    res.render('admin/create_user', {
      title: 'Provision New User - UniConnect',
      departments: depts.rows,
      hostels: hostels.rows,
      error: null
    });
  } catch (err) {
    console.error('Error loading create user form:', err);
    res.redirect('/admin/users?error=Failed+to+load+form');
  }
};

/**
 * Admin: Handle Create User
 */
exports.postCreateUser = async (req, res) => {
  const { username, password, role, full_name, email, enrollment_id, custom_hostel_id, department_id, hostel_id } = req.body;

  if (!username || !password || !role || !full_name || !email) {
    return res.redirect('/admin/users/create?error=Please+fill+in+all+required+fields');
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Insert into users table
    const userRes = await client.query(
      `INSERT INTO users (username, password_hash, role, full_name, email, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP)
       RETURNING user_id`,
      [username.trim(), passwordHash, role, full_name.trim(), email.trim()]
    );

    const newUserId = userRes.rows[0].user_id;

    // 3. Handle role-specific profiles
    if (role === 'Student') {
      if (!enrollment_id) {
        throw new Error('Enrollment ID is required for student accounts.');
      }
      await client.query(
        `INSERT INTO students (user_id, enrollment_id, custom_hostel_id)
         VALUES ($1, $2, $3)`,
        [newUserId, enrollment_id.trim(), custom_hostel_id ? custom_hostel_id.trim() : null]
      );
    } else if (role === 'Faculty') {
      if (!department_id) {
        throw new Error('Department is required for faculty accounts.');
      }
      await client.query(
        `INSERT INTO faculty (user_id, department_id)
         VALUES ($1, $2)`,
        [newUserId, department_id]
      );
    } else if (role === 'Warden') {
      if (hostel_id) {
        await client.query(
          `UPDATE hostels SET warden_user_id = $1 WHERE hostel_id = $2`,
          [newUserId, hostel_id]
        );
      }
    }

    await client.query('COMMIT');
    res.redirect(`/admin/users?success=User+${username}+provisioned+successfully+as+${role}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating user:', err);
    res.redirect(`/admin/users/create?error=${encodeURIComponent(err.message)}`);
  } finally {
    client.release();
  }
};

/**
 * Admin: Render Edit User Page
 */
exports.getEditUserPage = async (req, res) => {
  const { id } = req.params;

  try {
    const userRes = await db.query(
      `SELECT u.user_id, u.username, u.role, u.full_name, u.email, u.is_active, u.created_at,
              s.student_id, s.enrollment_id, s.custom_hostel_id,
              f.faculty_id, f.department_id,
              h.hostel_id
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       LEFT JOIN hostels h ON h.warden_user_id = u.user_id
       WHERE u.user_id = $1`,
      [id]
    );

    if (userRes.rows.length === 0) {
      return res.redirect('/admin/users?error=User+not+found');
    }

    const depts = await db.query(`SELECT department_id, name FROM departments ORDER BY name ASC`);
    const hostels = await db.query(`SELECT hostel_id, name, code FROM hostels ORDER BY name ASC`);

    res.render('admin/edit_user', {
      title: `Edit User: ${userRes.rows[0].username} - UniConnect`,
      user: userRes.rows[0],
      departments: depts.rows,
      hostels: hostels.rows,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (err) {
    console.error('Error loading edit user form:', err);
    res.redirect('/admin/users?error=Failed+to+load+user+edit+form');
  }
};

/**
 * Admin: Handle Edit User
 */
exports.postEditUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, username, is_active, enrollment_id, custom_hostel_id, department_id, hostel_id } = req.body;

  if (!full_name || !email || !username) {
    return res.redirect(`/admin/users/${id}/edit?error=Full+name,+email,+and+username+are+required`);
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify user exists
    const userCheck = await client.query(`SELECT user_id, role FROM users WHERE user_id = $1`, [id]);
    if (userCheck.rows.length === 0) {
      throw new Error('User not found.');
    }
    const targetUser = userCheck.rows[0];

    // 2. Check for username or email conflicts with other users
    const conflictCheck = await client.query(
      `SELECT user_id, username, email FROM users WHERE (username = $1 OR email = $2) AND user_id != $3`,
      [username.trim(), email.trim(), id]
    );

    if (conflictCheck.rows.length > 0) {
      const conflict = conflictCheck.rows[0];
      if (conflict.username.toLowerCase() === username.trim().toLowerCase()) {
        throw new Error(`Username "${username}" is already taken by another account.`);
      }
      if (conflict.email.toLowerCase() === email.trim().toLowerCase()) {
        throw new Error(`Email "${email}" is already in use by another account.`);
      }
    }

    const activeBool = is_active === 'true' || is_active === 'on' || is_active === true || is_active === '1';

    // 3. Update users table (profile fields only; FR-5 admin password reset reserved for Stage 8)
    await client.query(
      `UPDATE users
       SET username = $1, full_name = $2, email = $3, is_active = $4
       WHERE user_id = $5`,
      [username.trim(), full_name.trim(), email.trim(), activeBool, id]
    );

    // 4. Update role-specific profile
    if (targetUser.role === 'Student') {
      if (!enrollment_id || enrollment_id.trim() === '') {
        throw new Error('Enrollment ID is required for student accounts.');
      }
      const studentCheck = await client.query(`SELECT student_id FROM students WHERE user_id = $1`, [id]);
      if (studentCheck.rows.length > 0) {
        await client.query(
          `UPDATE students
           SET enrollment_id = $1, custom_hostel_id = $2
           WHERE user_id = $3`,
          [enrollment_id.trim(), custom_hostel_id ? custom_hostel_id.trim() : null, id]
        );
      } else {
        await client.query(
          `INSERT INTO students (user_id, enrollment_id, custom_hostel_id)
           VALUES ($1, $2, $3)`,
          [id, enrollment_id.trim(), custom_hostel_id ? custom_hostel_id.trim() : null]
        );
      }
    } else if (targetUser.role === 'Faculty') {
      if (!department_id) {
        throw new Error('Department is required for faculty accounts.');
      }
      const facCheck = await client.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [id]);
      if (facCheck.rows.length > 0) {
        await client.query(
          `UPDATE faculty SET department_id = $1 WHERE user_id = $2`,
          [department_id, id]
        );
      } else {
        await client.query(
          `INSERT INTO faculty (user_id, department_id) VALUES ($1, $2)`,
          [id, department_id]
        );
      }
    } else if (targetUser.role === 'Warden') {
      await client.query(`UPDATE hostels SET warden_user_id = NULL WHERE warden_user_id = $1`, [id]);
      if (hostel_id) {
        await client.query(`UPDATE hostels SET warden_user_id = $1 WHERE hostel_id = $2`, [id, hostel_id]);
      }
    }

    await client.query('COMMIT');
    res.redirect(`/admin/users?success=User+${encodeURIComponent(username)}+updated+successfully`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', err);
    res.redirect(`/admin/users/${id}/edit?error=${encodeURIComponent(err.message)}`);
  } finally {
    client.release();
  }
};

/**
 * Admin: Toggle User Active Status
 */
exports.postToggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      `UPDATE users SET is_active = NOT is_active WHERE user_id = $1`,
      [id]
    );
    res.redirect('/admin/users?success=User+status+updated');
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.redirect('/admin/users?error=Failed+to+update+user+status');
  }
};

/**
 * Admin: Course & Faculty Assignment Management
 */
exports.getCoursesManagement = async (req, res) => {
  try {
    const coursesRes = await db.query(
      `SELECT c.course_id, c.code, c.name, d.name AS department_name,
              COUNT(DISTINCT cf.faculty_id) AS faculty_count,
              COUNT(DISTINCT e.student_id) AS student_count
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN course_faculty cf ON c.course_id = cf.course_id
       LEFT JOIN enrollments e ON c.course_id = e.course_id
       GROUP BY c.course_id, c.code, c.name, d.name
       ORDER BY c.code ASC`
    );

    const depts = await db.query(`SELECT department_id, name FROM departments ORDER BY name ASC`);
    const facultyList = await db.query(
      `SELECT f.faculty_id, u.full_name, u.username
       FROM faculty f
       JOIN users u ON f.user_id = u.user_id
       WHERE u.is_active = TRUE
       ORDER BY u.full_name ASC`
    );
    const studentsList = await db.query(
      `SELECT s.student_id, s.enrollment_id, u.full_name
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       WHERE u.is_active = TRUE
       ORDER BY s.enrollment_id ASC`
    );

    res.render('admin/courses', {
      title: 'Course Management - UniConnect',
      courses: coursesRes.rows,
      departments: depts.rows,
      facultyList: facultyList.rows,
      studentsList: studentsList.rows,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error loading course management:', err);
    res.render('admin/courses', {
      title: 'Course Management - UniConnect',
      courses: [],
      departments: [],
      facultyList: [],
      studentsList: [],
      error: 'Failed to load courses.',
      success: null
    });
  }
};

/**
 * Admin: Create Course
 */
exports.postCreateCourse = async (req, res) => {
  const { code, name, department_id } = req.body;

  if (!code || !name || !department_id) {
    return res.redirect('/admin/courses?error=Please+fill+in+all+course+fields');
  }

  try {
    await db.query(
      `INSERT INTO courses (code, name, department_id) VALUES ($1, $2, $3)`,
      [code.trim().toUpperCase(), name.trim(), department_id]
    );
    res.redirect('/admin/courses?success=Course+created+successfully');
  } catch (err) {
    console.error('Error creating course:', err);
    res.redirect('/admin/courses?error=Failed+to+create+course');
  }
};

/**
 * Admin: Assign Faculty Instructor to Course
 */
exports.postAssignFaculty = async (req, res) => {
  const { course_id, faculty_id } = req.body;

  try {
    await db.query(
      `INSERT INTO course_faculty (course_id, faculty_id) VALUES ($1, $2)
       ON CONFLICT (course_id, faculty_id) DO NOTHING`,
      [course_id, faculty_id]
    );
    res.redirect('/admin/courses?success=Faculty+assigned+to+course');
  } catch (err) {
    console.error('Error assigning faculty:', err);
    res.redirect('/admin/courses?error=Failed+to+assign+faculty');
  }
};

/**
 * Admin: Enroll Student in Course
 */
exports.postEnrollStudent = async (req, res) => {
  const { course_id, student_id } = req.body;

  try {
    await db.query(
      `INSERT INTO enrollments (course_id, student_id) VALUES ($1, $2)
       ON CONFLICT (course_id, student_id) DO NOTHING`,
      [course_id, student_id]
    );
    res.redirect('/admin/courses?success=Student+enrolled+in+course');
  } catch (err) {
    console.error('Error enrolling student:', err);
    res.redirect('/admin/courses?error=Failed+to+enroll+student');
  }
};

/**
 * Admin: Audit Log Inspector (Immutable change trail)
 */
exports.getAuditLog = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.log_id, a.field_changed, a.old_value, a.new_value, a.changed_at,
              u.full_name AS changer_name, u.role AS changer_role,
              c.code AS course_code, c.name AS course_name,
              stu_u.full_name AS student_name, s.enrollment_id
       FROM audit_log a
       JOIN users u ON a.changed_by = u.user_id
       JOIN marks m ON a.marks_id = m.marks_id
       JOIN courses c ON m.course_id = c.course_id
       JOIN students s ON m.student_id = s.student_id
       JOIN users stu_u ON s.user_id = stu_u.user_id
       ORDER BY a.changed_at DESC
       LIMIT 100`
    );

    res.render('admin/audit', {
      title: 'Audit Trail Inspector - UniConnect',
      logs: result.rows,
      error: null
    });
  } catch (err) {
    console.error('Error fetching audit log:', err);
    res.render('admin/audit', {
      title: 'Audit Trail Inspector - UniConnect',
      logs: [],
      error: 'Failed to load audit logs from database.'
    });
  }
};
