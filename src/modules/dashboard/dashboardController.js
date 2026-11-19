const db = require('../../config/db');

/**
 * Central Dashboard Redirector
 */
exports.getDashboardRedirect = (req, res) => {
  const roleRedirects = {
    'Student': '/dashboard/student',
    'Faculty': '/dashboard/faculty',
    'Warden': '/dashboard/warden',
    'Mess Admin': '/dashboard/mess',
    'Admin': '/dashboard/admin'
  };
  const target = roleRedirects[req.session.user.role] || '/auth/login';
  res.redirect(target);
};

/**
 * Student Dashboard (Rich Live Data Center)
 */
exports.getStudentDashboard = async (req, res) => {
  const user = req.session.user;
  const currentMonth = new Date().toISOString().substring(0, 7);

  try {
    // 1. Enrolled courses & marks
    const coursesRes = await db.query(
      `SELECT c.course_id, c.code, c.name, m.marks_obtained, m.max_marks, m.grade
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       LEFT JOIN marks m ON m.course_id = c.course_id AND m.student_id = $1
       WHERE e.student_id = $1
       ORDER BY c.code ASC`,
      [user.studentId]
    );

    // 2. Today's 3 Meals
    const mealsRes = await db.query(
      `SELECT s.slot_id, s.name AS slot_name, s.start_time, s.end_time, m.items
       FROM meal_slots s
       LEFT JOIN menu_items m ON s.slot_id = m.slot_id AND m.menu_date = CURRENT_DATE
       ORDER BY s.start_time ASC`
    );

    // 3. Upcoming Deadlines & Quizzes
    const deadlinesRes = await db.query(
      `SELECT p.post_id, p.title, p.type, p.due_date, c.code AS course_code, u.full_name AS faculty_name
       FROM course_posts p
       JOIN courses c ON p.course_id = c.course_id
       JOIN enrollments e ON c.course_id = e.course_id
       JOIN faculty f ON p.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE e.student_id = $1 AND p.due_date >= CURRENT_TIMESTAMP - INTERVAL '1 day'
       ORDER BY p.due_date ASC
       LIMIT 5`,
      [user.studentId]
    );

    // 4. Latest Campus Notices
    const noticesRes = await db.query(
      `SELECT n.notice_id, n.title, n.body, n.created_at, u.full_name AS author_name, u.role AS author_role
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       ORDER BY n.created_at DESC
       LIMIT 3`
    );

    // 5. Active Hostel Complaints (if resident)
    let complaints = [];
    if (user.customHostelId) {
      const compRes = await db.query(
        `SELECT complaint_id, title, status, created_at, resolution_notes
         FROM complaints
         WHERE student_id = $1
         ORDER BY created_at DESC
         LIMIT 3`,
        [user.studentId]
      );
      complaints = compRes.rows;
    }

    // 6. Current Month Mess Subscription
    const messRes = await db.query(
      `SELECT status, payment_status, payment_method, transaction_id
       FROM mess_subscriptions
       WHERE student_id = $1 AND month_year = $2`,
      [user.studentId, currentMonth]
    );
    const messSub = messRes.rows[0] || null;

    res.render('dashboard/student', {
      title: 'Student Dashboard - UniConnect',
      courses: coursesRes.rows,
      meals: mealsRes.rows,
      deadlines: deadlinesRes.rows,
      notices: noticesRes.rows,
      complaints,
      messSub,
      currentMonth
    });

  } catch (err) {
    console.error('Error loading student dashboard:', err);
    res.render('dashboard/student', {
      title: 'Student Dashboard - UniConnect',
      courses: [],
      meals: [],
      deadlines: [],
      notices: [],
      complaints: [],
      messSub: null,
      currentMonth
    });
  }
};

/**
 * Faculty Dashboard (Rich Live Data Center)
 */
exports.getFacultyDashboard = async (req, res) => {
  const user = req.session.user;

  try {
    // 1. Courses taught with stats
    const coursesRes = await db.query(
      `SELECT c.course_id, c.code, c.name,
              COUNT(DISTINCT e.student_id) AS enrolled_count,
              COUNT(DISTINCT m.student_id) AS graded_count
       FROM courses c
       JOIN course_faculty cf ON c.course_id = cf.course_id
       LEFT JOIN enrollments e ON c.course_id = e.course_id
       LEFT JOIN marks m ON c.course_id = m.course_id
       WHERE cf.faculty_id = $1
       GROUP BY c.course_id, c.code, c.name
       ORDER BY c.code ASC`,
      [user.facultyId]
    );

    // 2. Upcoming Deadlines posted
    const deadlinesRes = await db.query(
      `SELECT p.post_id, p.title, p.type, p.due_date, c.code AS course_code
       FROM course_posts p
       JOIN courses c ON p.course_id = c.course_id
       WHERE p.faculty_id = $1
       ORDER BY p.due_date ASC NULLS LAST
       LIMIT 5`,
      [user.facultyId]
    );

    // 3. Recent Notices
    const noticesRes = await db.query(
      `SELECT n.notice_id, n.title, n.created_at, u.full_name AS author_name, u.role AS author_role
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       ORDER BY n.created_at DESC
       LIMIT 3`
    );

    res.render('dashboard/faculty', {
      title: 'Faculty Dashboard - UniConnect',
      courses: coursesRes.rows,
      deadlines: deadlinesRes.rows,
      notices: noticesRes.rows
    });
  } catch (err) {
    console.error('Error loading faculty dashboard:', err);
    res.render('dashboard/faculty', {
      title: 'Faculty Dashboard - UniConnect',
      courses: [],
      deadlines: [],
      notices: []
    });
  }
};

/**
 * Warden Dashboard
 */
exports.getWardenDashboard = async (req, res) => {
  const user = req.session.user;

  try {
    const hostelRes = await db.query(
      `SELECT hostel_id, name, code FROM hostels WHERE warden_user_id = $1`,
      [user.userId]
    );

    const hostel = hostelRes.rows[0] || null;
    let counts = { pending: 0, inProgress: 0, resolved: 0, total: 0 };
    let recentComplaints = [];

    if (hostel) {
      const statsRes = await db.query(
        `SELECT status, COUNT(*) AS count
         FROM complaints
         WHERE hostel_id = $1
         GROUP BY status`,
        [hostel.hostel_id]
      );
      statsRes.rows.forEach(r => {
        if (r.status === 'Pending') counts.pending = parseInt(r.count, 10);
        if (r.status === 'In Progress') counts.inProgress = parseInt(r.count, 10);
        if (r.status === 'Resolved') counts.resolved = parseInt(r.count, 10);
        counts.total += parseInt(r.count, 10);
      });

      const compRes = await db.query(
        `SELECT c.complaint_id, c.title, c.status, c.created_at,
                u.full_name AS student_name, s.enrollment_id, s.custom_hostel_id
         FROM complaints c
         JOIN students s ON c.student_id = s.student_id
         JOIN users u ON s.user_id = u.user_id
         WHERE c.hostel_id = $1
         ORDER BY c.created_at DESC
         LIMIT 5`,
        [hostel.hostel_id]
      );
      recentComplaints = compRes.rows;
    }

    res.render('dashboard/warden', {
      title: 'Warden Dashboard - UniConnect',
      hostel,
      counts,
      recentComplaints
    });
  } catch (err) {
    console.error('Error loading warden dashboard:', err);
    res.render('dashboard/warden', {
      title: 'Warden Dashboard - UniConnect',
      hostel: null,
      counts: { pending: 0, inProgress: 0, resolved: 0, total: 0 },
      recentComplaints: []
    });
  }
};

/**
 * Mess Admin Dashboard
 */
exports.getMessDashboard = async (req, res) => {
  const currentMonth = new Date().toISOString().substring(0, 7);

  try {
    // 1. Today's 3 Meals
    const mealsRes = await db.query(
      `SELECT s.slot_id, s.name AS slot_name, s.start_time, s.end_time, m.items
       FROM meal_slots s
       LEFT JOIN menu_items m ON s.slot_id = m.slot_id AND m.menu_date = CURRENT_DATE
       ORDER BY s.start_time ASC`
    );

    // 2. Subscription Stats for Current Month
    const statsRes = await db.query(
      `SELECT payment_status, COUNT(*) AS count
       FROM mess_subscriptions
       WHERE month_year = $1
       GROUP BY payment_status`,
      [currentMonth]
    );

    let stats = { pending: 0, verified: 0, rejected: 0, total: 0 };
    statsRes.rows.forEach(r => {
      if (r.payment_status === 'PENDING_VERIFICATION') stats.pending = parseInt(r.count, 10);
      if (r.payment_status === 'VERIFIED') stats.verified = parseInt(r.count, 10);
      if (r.payment_status === 'REJECTED') stats.rejected = parseInt(r.count, 10);
      stats.total += parseInt(r.count, 10);
    });

    res.render('dashboard/mess', {
      title: 'Mess Dashboard - UniConnect',
      meals: mealsRes.rows,
      stats,
      currentMonth
    });
  } catch (err) {
    console.error('Error loading mess dashboard:', err);
    res.render('dashboard/mess', {
      title: 'Mess Dashboard - UniConnect',
      meals: [],
      stats: { pending: 0, verified: 0, rejected: 0, total: 0 },
      currentMonth
    });
  }
};

/**
 * Admin Dashboard
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    const userCount = await db.query(`SELECT role, COUNT(*) AS count FROM users GROUP BY role`);
    const courseCount = await db.query(`SELECT COUNT(*) AS count FROM courses`);
    const complaintCount = await db.query(`SELECT status, COUNT(*) AS count FROM complaints GROUP BY status`);
    const auditRes = await db.query(
      `SELECT a.log_id, a.field_changed, a.new_value, a.changed_at,
              u.full_name AS changer_name, c.code AS course_code, s.enrollment_id
       FROM audit_log a
       JOIN users u ON a.changed_by = u.user_id
       JOIN marks m ON a.marks_id = m.marks_id
       JOIN courses c ON m.course_id = c.course_id
       JOIN students s ON m.student_id = s.student_id
       ORDER BY a.changed_at DESC
       LIMIT 5`
    );

    let roleCounts = { Student: 0, Faculty: 0, Warden: 0, 'Mess Admin': 0, Admin: 0, total: 0 };
    userCount.rows.forEach(r => {
      if (roleCounts[r.role] !== undefined) roleCounts[r.role] = parseInt(r.count, 10);
      roleCounts.total += parseInt(r.count, 10);
    });

    let openComplaints = 0;
    complaintCount.rows.forEach(r => {
      if (r.status !== 'Resolved') openComplaints += parseInt(r.count, 10);
    });

    res.render('dashboard/admin', {
      title: 'Admin Dashboard - UniConnect',
      roleCounts,
      totalCourses: parseInt(courseCount.rows[0].count, 10),
      openComplaints,
      recentAudit: auditRes.rows
    });
  } catch (err) {
    console.error('Error loading admin dashboard:', err);
    res.render('dashboard/admin', {
      title: 'Admin Dashboard - UniConnect',
      roleCounts: { Student: 0, Faculty: 0, Warden: 0, 'Mess Admin': 0, Admin: 0, total: 0 },
      totalCourses: 0,
      openComplaints: 0,
      recentAudit: []
    });
  }
};
