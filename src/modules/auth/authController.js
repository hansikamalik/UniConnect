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
       WHERE u.username = $1`,
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
