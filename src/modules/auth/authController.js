const bcrypt = require('bcryptjs');
const db = require('../../config/db');

/**
 * Render Login Page
 */
exports.getLoginPage = (req, res) => {
  const error = req.query.error || null;
  const success = req.query.logged_out ? 'You have been successfully logged out.' : null;
  res.render('auth/login', {
    title: 'Login - UniConnect',
    error,
    success,
    username: req.query.username || ''
  });
};

/**
 * Handle Login Submission
 */
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('auth/login', {
      title: 'Login - UniConnect',
      error: 'Please enter both username and password.',
      success: null,
      username: username || ''
    });
  }

  try {
    const result = await db.query(
      `SELECT u.user_id, u.username, u.password_hash, u.role, u.full_name, u.email, u.is_active,
              s.student_id, s.enrollment_id, s.custom_hostel_id,
              f.faculty_id, f.department_id
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       WHERE u.username = $1 OR s.enrollment_id = $1 OR LOWER(u.email) = LOWER($1)`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.render('auth/login', {
        title: 'Login - UniConnect',
        error: 'Invalid username or password.',
        success: null,
        username
      });
    }

    const user = result.rows[0];

    // Check account status
    if (!user.is_active) {
      return res.render('auth/login', {
        title: 'Login - UniConnect',
        error: 'Account is deactivated. Please contact the administrator.',
        success: null,
        username
      });
    }

    // Verify bcrypt hash
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('auth/login', {
        title: 'Login - UniConnect',
        error: 'Invalid username or password.',
        success: null,
        username
      });
    }

    // Establish session
    req.session.user = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      email: user.email,
      studentId: user.student_id || null,
      enrollmentId: user.enrollment_id || null,
      customHostelId: user.custom_hostel_id || null,
      facultyId: user.faculty_id || null,
      departmentId: user.department_id || null
    };

    // Redirect to role-specific dashboard
    const roleRedirects = {
      'Student': '/dashboard/student',
      'Faculty': '/dashboard/faculty',
      'Warden': '/dashboard/warden',
      'Mess Admin': '/dashboard/mess',
      'Admin': '/dashboard/admin'
    };

    const targetUrl = req.session.returnTo || roleRedirects[user.role] || '/';
    delete req.session.returnTo;
    return res.redirect(targetUrl);

  } catch (err) {
    console.error('Login error:', err);
    return res.render('auth/login', {
      title: 'Login - UniConnect',
      error: 'An internal error occurred while trying to log in. Please try again.',
      success: null,
      username
    });
  }
};

/**
 * FR-10: User Profile View
 */
exports.getProfilePage = async (req, res) => {
  const userId = req.session.user && req.session.user.userId;

  if (!userId) {
    return res.redirect('/auth/login');
  }

  try {
    const userRes = await db.query(
      `SELECT u.user_id, u.username, u.role, u.full_name, u.email, u.created_at,
              s.student_id, s.enrollment_id, s.custom_hostel_id,
              f.faculty_id, d.name AS department_name,
              h.name AS hostel_name, h.code AS hostel_code
       FROM users u
       LEFT JOIN students s ON u.user_id = s.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       LEFT JOIN departments d ON f.department_id = d.department_id
       LEFT JOIN hostels h ON h.warden_user_id = u.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.redirect('/auth/login');
    }

    const profile = userRes.rows[0];
    let courses = [];

    if (profile.role === 'Student' && profile.student_id) {
      const coursesRes = await db.query(
        `SELECT c.course_id, c.code, c.name, d.name AS department_name
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         LEFT JOIN departments d ON c.department_id = d.department_id
         WHERE e.student_id = $1
         ORDER BY c.code ASC`,
        [profile.student_id]
      );
      courses = coursesRes.rows;
    } else if (profile.role === 'Faculty' && profile.faculty_id) {
      const coursesRes = await db.query(
        `SELECT c.course_id, c.code, c.name,
                COUNT(e.student_id) AS student_count
         FROM course_faculty cf
         JOIN courses c ON cf.course_id = c.course_id
         LEFT JOIN enrollments e ON c.course_id = e.course_id
         WHERE cf.faculty_id = $1
         GROUP BY c.course_id, c.code, c.name
         ORDER BY c.code ASC`,
        [profile.faculty_id]
      );
      courses = coursesRes.rows;
    }

    res.render('profile/view', {
      title: `${profile.full_name} - Institutional Profile`,
      profile,
      courses
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.redirect('/dashboard?error=Failed+to+load+profile');
  }
};

/**
 * Handle Logout
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login?logged_out=1');
  });
};

/**
 * FR-35: Render User Self-Service Change Password Page
 */
exports.getChangePasswordPage = (req, res) => {
  const query = (req && req.query) || {};
  res.render('auth/change_password', {
    title: 'Change Password - UniConnect',
    error: query.error || null,
    success: query.success || null
  });
};

/**
 * FR-35: Handle User Self-Service Change Password
 */
exports.postChangePassword = async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const userId = req.session.user && req.session.user.userId;

  if (!userId) {
    return res.redirect('/auth/login');
  }

  if (!current_password || !new_password || !confirm_password) {
    return res.render('auth/change_password', {
      title: 'Change Password - UniConnect',
      error: 'Please fill in all password fields.',
      success: null
    });
  }

  if (new_password !== confirm_password) {
    return res.render('auth/change_password', {
      title: 'Change Password - UniConnect',
      error: 'New password and confirmation do not match.',
      success: null
    });
  }

  if (new_password.length < 6) {
    return res.render('auth/change_password', {
      title: 'Change Password - UniConnect',
      error: 'New password must be at least 6 characters long.',
      success: null
    });
  }

  try {
    const userRes = await db.query(`SELECT password_hash FROM users WHERE user_id = $1`, [userId]);
    if (userRes.rows.length === 0) {
      return res.redirect('/auth/login');
    }

    const currentHash = userRes.rows[0].password_hash;
    const isCurrentValid = await bcrypt.compare(current_password, currentHash);
    if (!isCurrentValid) {
      return res.render('auth/change_password', {
        title: 'Change Password - UniConnect',
        error: 'Current password is incorrect.',
        success: null
      });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.query(`UPDATE users SET password_hash = $1 WHERE user_id = $2`, [newHash, userId]);

    return res.render('auth/change_password', {
      title: 'Change Password - UniConnect',
      success: 'Your password has been updated successfully.',
      error: null
    });
  } catch (err) {
    console.error('Error changing password:', err);
    return res.render('auth/change_password', {
      title: 'Change Password - UniConnect',
      error: 'Failed to update password. Please try again.',
      success: null
    });
  }
};
