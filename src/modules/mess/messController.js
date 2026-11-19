const path = require('path');
const db = require('../../config/db');

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * View Mess Menu (S-16, FR-16: Daily and Weekly views)
 * Defaults to today's date, or query parameter ?date=YYYY-MM-DD or ?view=week
 */
exports.getMenuView = async (req, res) => {
  const viewMode = req.query.view === 'week' ? 'week' : 'daily';
  const selectedDate = req.query.date || formatDate(new Date());

  try {
    const isMessAdmin = req.session.user && ['Mess Admin', 'Admin'].includes(req.session.user.role);

    if (viewMode === 'week') {
      // Calculate current week (Monday to Sunday)
      const baseDate = new Date(selectedDate + 'T00:00:00');
      const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 1 is Monday
      const distanceToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() - distanceToMonday);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDates.push(formatDate(d));
      }

      // Query slots and menus for all 7 days
      const slotsRes = await db.query(`SELECT slot_id, name AS slot_name, start_time, end_time FROM meal_slots ORDER BY start_time ASC`);
      const menuRes = await db.query(
        `SELECT m.menu_date, m.slot_id, m.items
         FROM menu_items m
         WHERE m.menu_date = ANY($1::date[])`,
        [weekDates]
      );

      // Structure: matrix of [date][slot_id] -> items
      const menuMap = {};
      weekDates.forEach(d => { menuMap[d] = {}; });
      menuRes.rows.forEach(r => {
        const dStr = formatDate(new Date(r.menu_date));
        if (menuMap[dStr]) {
          menuMap[dStr][r.slot_id] = r.items;
        }
      });

      return res.render('mess/menu', {
        title: 'Weekly Mess Schedule (FR-16) - UniConnect',
        viewMode: 'week',
        selectedDate,
        slots: slotsRes.rows,
        weekDates,
        menuMap,
        isMessAdmin,
        success: req.query.success || null,
        error: req.query.error || null
      });
    }

    // Daily View
    const result = await db.query(
      `SELECT s.slot_id, s.name AS slot_name, s.start_time, s.end_time,
              m.menu_id, m.items, m.updated_at, u.full_name AS updated_by_name
       FROM meal_slots s
       LEFT JOIN menu_items m ON s.slot_id = m.slot_id AND m.menu_date = $1
       LEFT JOIN users u ON m.posted_by = u.user_id
       ORDER BY s.start_time ASC`,
      [selectedDate]
    );

    res.render('mess/menu', {
      title: `Mess Menu (${selectedDate}) - UniConnect`,
      viewMode: 'daily',
      selectedDate,
      slots: result.rows,
      weekDates: [],
      menuMap: {},
      isMessAdmin,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.render('mess/menu', {
      title: 'Mess Menu - UniConnect',
      viewMode: 'daily',
      selectedDate,
      slots: [],
      weekDates: [],
      menuMap: {},
      isMessAdmin: false,
      error: 'Failed to load mess menu.',
      success: null
    });
  }
};

/**
 * Mess Admin: Render Edit Menu Page (S-17)
 */
exports.getEditMenuPage = async (req, res) => {
  const targetDate = req.query.date || formatDate(new Date());

  try {
    const result = await db.query(
      `SELECT s.slot_id, s.name AS slot_name, s.start_time, s.end_time,
              m.items
       FROM meal_slots s
       LEFT JOIN menu_items m ON s.slot_id = m.slot_id AND m.menu_date = $1
       ORDER BY s.start_time ASC`,
      [targetDate]
    );

    res.render('mess/edit_menu', {
      title: `Update Mess Menu (${targetDate}) - UniConnect`,
      targetDate,
      slots: result.rows,
      error: null
    });
  } catch (err) {
    console.error('Error loading menu editor:', err);
    res.redirect(`/mess/menu?date=${targetDate}&error=Failed+to+load+menu+editor`);
  }
};

/**
 * Mess Admin: Save Menu Updates (Upsert)
 */
exports.postEditMenu = async (req, res) => {
  const { menu_date, items } = req.body;
  // items is an object keyed by slot_id: items[slot_id]
  const userId = req.session.user.userId;

  if (!menu_date) {
    return res.redirect('/mess/menu?error=Missing+menu+date');
  }

  try {
    // Upsert each slot item
    for (const [slotId, itemText] of Object.entries(items || {})) {
      if (itemText && itemText.trim()) {
        await db.query(
          `INSERT INTO menu_items (menu_date, slot_id, items, posted_by, updated_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
           ON CONFLICT (menu_date, slot_id)
           DO UPDATE SET items = EXCLUDED.items,
                         posted_by = EXCLUDED.posted_by,
                         updated_at = CURRENT_TIMESTAMP`,
          [menu_date, slotId, itemText.trim(), userId]
        );
      }
    }

    res.redirect(`/mess/menu?date=${menu_date}&success=Menu+updated+successfully`);
  } catch (err) {
    console.error('Error updating menu items:', err);
    res.redirect(`/mess/menu?date=${menu_date}&error=Failed+to+save+menu+updates`);
  }
};

/**
 * Student: View Mess Subscription Status & Payment Upload (S-21)
 */
exports.getStudentSubscriptionView = async (req, res) => {
  const { studentId } = req.session.user;
  const currentMonthYear = new Date().toISOString().substring(0, 7); // e.g. "2026-11"

  try {
    const result = await db.query(
      `SELECT * FROM mess_subscriptions
       WHERE student_id = $1 AND month_year = $2`,
      [studentId, currentMonthYear]
    );

    const subscription = result.rows[0] || null;

    res.render('mess/subscriptions', {
      title: 'Mess Subscription & Payment - UniConnect',
      currentMonthYear,
      subscription,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    res.render('mess/subscriptions', {
      title: 'Mess Subscription & Payment - UniConnect',
      currentMonthYear,
      subscription: null,
      error: 'Failed to load subscription details.',
      success: null
    });
  }
};

/**
 * Student: Submit Opt-In with Online UPI Payment Proof
 */
exports.postSubmitSubscription = async (req, res) => {
  const { studentId } = req.session.user;
  const { month_year, transaction_id, status } = req.body;
  const proofFile = req.file;

  const choice = status || 'OPTED_IN';

  try {
    if (choice === 'OPTED_OUT') {
      await db.query(
        `INSERT INTO mess_subscriptions (student_id, month_year, status, payment_status, submitted_at)
         VALUES ($1, $2, 'OPTED_OUT', 'REJECTED', CURRENT_TIMESTAMP)
         ON CONFLICT (student_id, month_year)
         DO UPDATE SET status = 'OPTED_OUT', payment_status = 'REJECTED', submitted_at = CURRENT_TIMESTAMP`,
        [studentId, month_year]
      );
      return res.redirect('/mess/subscription?success=Opted+out+of+mess+for+' + month_year);
    }

    // Student Opted In
    if (!transaction_id || !proofFile) {
      return res.redirect('/mess/subscription?error=Please+provide+both+the+UPI+transaction+ID+and+proof+screenshot');
    }

    const proofUrl = `/uploads/mess_proofs/${proofFile.filename}`;

    await db.query(
      `INSERT INTO mess_subscriptions
         (student_id, month_year, status, payment_method, payment_status, transaction_id, payment_proof_url, submitted_at)
       VALUES
         ($1, $2, 'OPTED_IN', 'UPI', 'PENDING_VERIFICATION', $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, month_year)
       DO UPDATE SET
         status = 'OPTED_IN',
         payment_method = 'UPI',
         payment_status = 'PENDING_VERIFICATION',
         transaction_id = EXCLUDED.transaction_id,
         payment_proof_url = EXCLUDED.payment_proof_url,
         submitted_at = CURRENT_TIMESTAMP`,
      [studentId, month_year, transaction_id.trim(), proofUrl]
    );

    res.redirect('/mess/subscription?success=Payment+submitted+for+verification.+Status:+PENDING_VERIFICATION');
  } catch (err) {
    console.error('Error submitting mess payment:', err);
    res.redirect('/mess/subscription?error=Failed+to+submit+payment');
  }
};

/**
 * Mess Admin: Manage Subscriptions & Verify Payments (S-22)
 */
exports.getAdminManageSubscriptions = async (req, res) => {
  const monthYear = req.query.month || new Date().toISOString().substring(0, 7);
  const statusFilter = req.query.status || 'ALL';

  try {
    let queryText = `
      SELECT sub.*, s.enrollment_id, s.custom_hostel_id, u.full_name AS student_name, u.email AS student_email,
             v.full_name AS verified_by_name
      FROM mess_subscriptions sub
      JOIN students s ON sub.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN users v ON sub.verified_by = v.user_id
      WHERE sub.month_year = $1`;
    let params = [monthYear];

    if (statusFilter !== 'ALL') {
      queryText += ` AND sub.payment_status = $2`;
      params.push(statusFilter);
    }

    queryText += ` ORDER BY sub.submitted_at DESC NULLS LAST`;

    const result = await db.query(queryText, params);

    res.render('mess/admin_subscriptions', {
      title: 'Mess Subscriptions Verification - UniConnect',
      monthYear,
      statusFilter,
      subscriptions: result.rows,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching subscriptions for admin:', err);
    res.render('mess/admin_subscriptions', {
      title: 'Mess Subscriptions Verification - UniConnect',
      monthYear,
      statusFilter,
      subscriptions: [],
      error: 'Failed to load subscriptions.',
      success: null
    });
  }
};

/**
 * Mess Admin: Verify Online Payment ([Approve] / [Reject])
 */
exports.postVerifyPayment = async (req, res) => {
  const { id } = req.params;
  const { action, remarks } = req.body;
  const adminId = req.session.user.userId;

  const newStatus = action === 'APPROVE' ? 'VERIFIED' : 'REJECTED';

  try {
    await db.query(
      `UPDATE mess_subscriptions
       SET payment_status = $1,
           verified_at = CURRENT_TIMESTAMP,
           verified_by = $2,
           admin_remarks = $3
       WHERE subscription_id = $4`,
      [newStatus, adminId, remarks ? remarks.trim() : null, id]
    );

    res.redirect(`/mess/subscriptions/manage?success=Subscription+marked+as+${newStatus}`);
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.redirect('/mess/subscriptions/manage?error=Failed+to+update+subscription+status');
  }
};

/**
 * Mess Admin: Record Manual Cash Payment (S-22 Modal)
 */
exports.postRecordCashPayment = async (req, res) => {
  const { student_enrollment_id, month_year, remarks } = req.body;
  const adminId = req.session.user.userId;

  if (!student_enrollment_id || !month_year) {
    return res.redirect('/mess/subscriptions/manage?error=Missing+required+fields');
  }

  try {
    // Find student_id by enrollment_id
    const studentRes = await db.query(
      `SELECT student_id FROM students WHERE enrollment_id = $1`,
      [student_enrollment_id.trim()]
    );

    if (studentRes.rows.length === 0) {
      return res.redirect('/mess/subscriptions/manage?error=Student+with+Enrollment+ID+' + student_enrollment_id + '+not+found');
    }

    const studentId = studentRes.rows[0].student_id;

    await db.query(
      `INSERT INTO mess_subscriptions
         (student_id, month_year, status, payment_method, payment_status, submitted_at, verified_at, verified_by, admin_remarks)
       VALUES
         ($1, $2, 'OPTED_IN', 'CASH', 'VERIFIED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4)
       ON CONFLICT (student_id, month_year)
       DO UPDATE SET
         status = 'OPTED_IN',
         payment_method = 'CASH',
         payment_status = 'VERIFIED',
         verified_at = CURRENT_TIMESTAMP,
         verified_by = EXCLUDED.verified_by,
         admin_remarks = EXCLUDED.admin_remarks`,
      [studentId, month_year, adminId, remarks ? remarks.trim() : 'Manual Cash Receipt recorded by Mess Admin']
    );

    res.redirect('/mess/subscriptions/manage?success=Cash+payment+recorded+and+VERIFIED+for+' + student_enrollment_id);
  } catch (err) {
    console.error('Error recording cash payment:', err);
    res.redirect('/mess/subscriptions/manage?error=Failed+to+record+cash+payment');
  }
};
