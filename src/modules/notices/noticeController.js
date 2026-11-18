const db = require('../../config/db');

/**
 * List all notices (accessible to all authenticated users)
 */
exports.getAllNotices = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT n.notice_id, n.title, n.body, n.created_at, n.posted_by,
              u.full_name AS author_name, u.role AS author_role
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       ORDER BY n.created_at DESC`
    );

    const canCreate = ['Admin', 'Faculty', 'Warden', 'Mess Admin'].includes(req.session.user.role);

    res.render('notices/index', {
      title: 'Campus Notices - UniConnect',
      notices: result.rows,
      canCreate,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching notices:', err);
    res.render('notices/index', {
      title: 'Campus Notices - UniConnect',
      notices: [],
      canCreate: false,
      error: 'Unable to load notices from database.',
      success: null
    });
  }
};

/**
 * Render create notice form
 */
exports.getCreateNoticePage = (req, res) => {
  res.render('notices/create', {
    title: 'Publish Campus Notice - UniConnect',
    error: null
  });
};

/**
 * Handle create notice submission
 */
exports.postCreateNotice = async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body || !title.trim() || !body.trim()) {
    return res.render('notices/create', {
      title: 'Publish Campus Notice - UniConnect',
      error: 'Please fill in both the title and body of the notice.'
    });
  }

  try {
    await db.query(
      `INSERT INTO notices (title, body, posted_by, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [title.trim(), body.trim(), req.session.user.userId]
    );

    res.redirect('/notices?success=Notice+published+successfully');
  } catch (err) {
    console.error('Error creating notice:', err);
    res.render('notices/create', {
      title: 'Publish Campus Notice - UniConnect',
      error: 'Failed to publish notice. Please try again.'
    });
  }
};

/**
 * View single notice details
 */
exports.getNoticeById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT n.notice_id, n.title, n.body, n.created_at, n.posted_by,
              u.full_name AS author_name, u.role AS author_role
       FROM notices n
       JOIN users u ON n.posted_by = u.user_id
       WHERE n.notice_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).render('errors/404', { title: 'Notice Not Found' });
    }

    const notice = result.rows[0];
    const canDelete =
      req.session.user.role === 'Admin' ||
      req.session.user.userId === notice.posted_by;

    res.render('notices/view', {
      title: `${notice.title} - UniConnect`,
      notice,
      canDelete
    });
  } catch (err) {
    console.error('Error loading notice:', err);
    res.status(500).render('errors/403', {
      title: 'Error Loading Notice',
      message: 'Could not load notice details.',
      user: req.session.user
    });
  }
};

/**
 * Handle delete notice
 */
exports.deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const checkResult = await db.query(
      `SELECT posted_by FROM notices WHERE notice_id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.redirect('/notices?error=Notice+not+found');
    }

    const postedBy = checkResult.rows[0].posted_by;
    const isAuthorized =
      req.session.user.role === 'Admin' ||
      req.session.user.userId === postedBy;

    if (!isAuthorized) {
      return res.status(403).render('errors/403', {
        title: 'Access Denied',
        message: 'You are not authorized to delete this notice.',
        user: req.session.user
      });
    }

    await db.query(`DELETE FROM notices WHERE notice_id = $1`, [id]);
    res.redirect('/notices?success=Notice+deleted+successfully');
  } catch (err) {
    console.error('Error deleting notice:', err);
    res.redirect('/notices?error=Failed+to+delete+notice');
  }
};
