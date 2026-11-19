const db = require('../../config/db');

/**
 * Student: View own complaints
 */
exports.getStudentComplaints = async (req, res) => {
  const { studentId, customHostelId } = req.session.user;

  // Day scholar check (customHostelId is null)
  if (!customHostelId) {
    return res.render('hostel/day_scholar', {
      title: 'Hostel Services - UniConnect'
    });
  }

  try {
    const result = await db.query(
      `SELECT c.complaint_id, c.title, c.description, c.status, c.resolution_notes,
              c.created_at, c.updated_at, h.name AS hostel_name, h.code AS hostel_code
       FROM complaints c
       JOIN hostels h ON c.hostel_id = h.hostel_id
       WHERE c.student_id = $1
       ORDER BY c.created_at DESC`,
      [studentId]
    );

    res.render('hostel/student_complaints', {
      title: 'My Hostel Complaints - UniConnect',
      complaints: result.rows,
      customHostelId,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching student complaints:', err);
    res.render('hostel/student_complaints', {
      title: 'My Hostel Complaints - UniConnect',
      complaints: [],
      customHostelId,
      error: 'Failed to load complaints from database.',
      success: null
    });
  }
};

/**
 * Student: Render new complaint form
 */
exports.getNewComplaintPage = async (req, res) => {
  const { customHostelId } = req.session.user;

  if (!customHostelId) {
    return res.redirect('/hostel/complaints');
  }

  try {
    // Get list of hostels so student can confirm/select their hostel
    const hostelsResult = await db.query(`SELECT hostel_id, name, code FROM hostels ORDER BY name ASC`);

    res.render('hostel/new_complaint', {
      title: 'Submit Hostel Complaint - UniConnect',
      hostels: hostelsResult.rows,
      customHostelId,
      error: null
    });
  } catch (err) {
    console.error('Error loading hostel form:', err);
    res.redirect('/hostel/complaints?error=Could+not+load+complaint+form');
  }
};

/**
 * Student: Submit new complaint
 */
exports.postNewComplaint = async (req, res) => {
  const { studentId, customHostelId } = req.session.user;
  const { hostel_id, title, description } = req.body;

  if (!customHostelId) {
    return res.status(403).send('Day scholars cannot submit hostel complaints.');
  }

  if (!hostel_id || !title || !description || !title.trim() || !description.trim()) {
    try {
      const hostelsResult = await db.query(`SELECT hostel_id, name, code FROM hostels ORDER BY name ASC`);
      return res.render('hostel/new_complaint', {
        title: 'Submit Hostel Complaint - UniConnect',
        hostels: hostelsResult.rows,
        customHostelId,
        error: 'Please fill in all required fields.'
      });
    } catch {
      return res.redirect('/hostel/complaints');
    }
  }

  try {
    await db.query(
      `INSERT INTO complaints (student_id, hostel_id, title, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [studentId, hostel_id, title.trim(), description.trim()]
    );

    res.redirect('/hostel/complaints?success=Complaint+submitted+successfully.+Status:+Pending');
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.redirect('/hostel/complaints?error=Failed+to+submit+complaint');
  }
};

/**
 * Warden / Admin: View and manage complaints
 * Per Decision D-2: Warden only sees complaints for their assigned hostel.
 */
exports.getWardenManageComplaints = async (req, res) => {
  const user = req.session.user;
  const statusFilter = req.query.status || 'ALL';

  try {
    let queryText = '';
    let queryParams = [];

    if (user.role === 'Admin') {
      // Admin can see all complaints across all hostels
      if (statusFilter !== 'ALL') {
        queryText = `
          SELECT c.*, h.name AS hostel_name, h.code AS hostel_code,
                 u.full_name AS student_name, s.enrollment_id, s.custom_hostel_id
          FROM complaints c
          JOIN hostels h ON c.hostel_id = h.hostel_id
          JOIN students s ON c.student_id = s.student_id
          JOIN users u ON s.user_id = u.user_id
          WHERE c.status = $1
          ORDER BY c.created_at DESC`;
        queryParams = [statusFilter];
      } else {
        queryText = `
          SELECT c.*, h.name AS hostel_name, h.code AS hostel_code,
                 u.full_name AS student_name, s.enrollment_id, s.custom_hostel_id
          FROM complaints c
          JOIN hostels h ON c.hostel_id = h.hostel_id
          JOIN students s ON c.student_id = s.student_id
          JOIN users u ON s.user_id = u.user_id
          ORDER BY c.created_at DESC`;
      }
    } else {
      // Warden: Find the hostel assigned to this warden
      const hostelRes = await db.query(
        `SELECT hostel_id, name, code FROM hostels WHERE warden_user_id = $1`,
        [user.userId]
      );

      if (hostelRes.rows.length === 0) {
        return res.render('hostel/warden_manage', {
          title: 'Hostel Complaints - UniConnect',
          complaints: [],
          assignedHostel: null,
          statusFilter,
          error: 'You have not been assigned to a hostel yet. Please contact the administrator.',
          success: null
        });
      }

      const assignedHostel = hostelRes.rows[0];

      if (statusFilter !== 'ALL') {
        queryText = `
          SELECT c.*, h.name AS hostel_name, h.code AS hostel_code,
                 u.full_name AS student_name, s.enrollment_id, s.custom_hostel_id
          FROM complaints c
          JOIN hostels h ON c.hostel_id = h.hostel_id
          JOIN students s ON c.student_id = s.student_id
          JOIN users u ON s.user_id = u.user_id
          WHERE c.hostel_id = $1 AND c.status = $2
          ORDER BY c.created_at DESC`;
        queryParams = [assignedHostel.hostel_id, statusFilter];
      } else {
        queryText = `
          SELECT c.*, h.name AS hostel_name, h.code AS hostel_code,
                 u.full_name AS student_name, s.enrollment_id, s.custom_hostel_id
          FROM complaints c
          JOIN hostels h ON c.hostel_id = h.hostel_id
          JOIN students s ON c.student_id = s.student_id
          JOIN users u ON s.user_id = u.user_id
          WHERE c.hostel_id = $1
          ORDER BY c.created_at DESC`;
        queryParams = [assignedHostel.hostel_id];
      }
    }

    const result = await db.query(queryText, queryParams);

    res.render('hostel/warden_manage', {
      title: 'Manage Hostel Complaints - UniConnect',
      complaints: result.rows,
      statusFilter,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching warden complaints:', err);
    res.render('hostel/warden_manage', {
      title: 'Manage Hostel Complaints - UniConnect',
      complaints: [],
      statusFilter,
      error: 'Failed to load complaints from database.',
      success: null
    });
  }
};

/**
 * Warden / Admin: Update complaint status & resolution
 */
exports.postUpdateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resolution_notes } = req.body;
  const user = req.session.user;

  if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
    return res.redirect('/hostel/complaints/manage?error=Invalid+status+selected');
  }

  try {
    // If Warden, verify complaint belongs to their hostel
    if (user.role === 'Warden') {
      const checkRes = await db.query(
        `SELECT c.complaint_id FROM complaints c
         JOIN hostels h ON c.hostel_id = h.hostel_id
         WHERE c.complaint_id = $1 AND h.warden_user_id = $2`,
        [id, user.userId]
      );

      if (checkRes.rows.length === 0) {
        return res.status(403).send('Forbidden: You can only update complaints for your assigned hostel.');
      }
    }

    await db.query(
      `UPDATE complaints
       SET status = $1,
           resolution_notes = $2,
           updated_by = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE complaint_id = $4`,
      [status, resolution_notes ? resolution_notes.trim() : null, user.userId, id]
    );

    res.redirect(`/hostel/complaints/manage?success=Complaint+%23${id}+updated+to+${status}`);
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.redirect('/hostel/complaints/manage?error=Failed+to+update+complaint+status');
  }
};
