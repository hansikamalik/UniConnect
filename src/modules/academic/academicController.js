const db = require('../../config/db');

/**
 * Calculate grade based on percentage using grade_scales
 */
async function calculateGrade(client, marksObtained, maxMarks) {
  const percent = (parseFloat(marksObtained) / parseFloat(maxMarks)) * 100;
  const gradeRes = await client.query(
    `SELECT grade FROM grade_scales WHERE min_percent <= $1 ORDER BY min_percent DESC LIMIT 1`,
    [percent]
  );
  return gradeRes.rows.length > 0 ? gradeRes.rows[0].grade : 'F';
}

/**
 * Student: View enrolled courses & internal marks (S-03)
 */
exports.getStudentMarks = async (req, res) => {
  const { studentId, enrollmentId } = req.session.user;

  try {
    const result = await db.query(
      `SELECT c.course_id, c.code AS course_code, c.name AS course_name,
              d.name AS department_name,
              m.marks_id, m.marks_obtained, m.max_marks, m.grade, m.updated_at,
              u.full_name AS updated_by_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       LEFT JOIN departments d ON c.department_id = d.department_id
       LEFT JOIN marks m ON m.course_id = c.course_id AND m.student_id = $1
       LEFT JOIN users u ON m.updated_by = u.user_id
       WHERE e.student_id = $1
       ORDER BY c.code ASC`,
      [studentId]
    );

    res.render('academic/student_marks', {
      title: 'My Academic Grades - UniConnect',
      enrollmentId,
      courses: result.rows,
      error: null
    });
  } catch (err) {
    console.error('Error fetching student marks:', err);
    res.render('academic/student_marks', {
      title: 'My Academic Grades - UniConnect',
      enrollmentId,
      courses: [],
      error: 'Failed to load grades from database.'
    });
  }
};

/**
 * Faculty: View course list & marks entry interface (S-11)
 */
exports.getMarksEntryPage = async (req, res) => {
  const { facultyId } = req.session.user;
  const selectedCourseId = req.query.course_id || null;

  try {
    // 1. Get courses taught by this faculty member (Ownership check D-4)
    const coursesRes = await db.query(
      `SELECT c.course_id, c.code, c.name
       FROM courses c
       JOIN course_faculty cf ON c.course_id = cf.course_id
       WHERE cf.faculty_id = $1
       ORDER BY c.code ASC`,
      [facultyId]
    );
    const assignedCourses = coursesRes.rows;

    let students = [];
    let currentCourse = null;

    if (selectedCourseId) {
      currentCourse = assignedCourses.find(c => String(c.course_id) === String(selectedCourseId));

      if (currentCourse) {
        // Fetch students enrolled in this course with their marks
        const studentsRes = await db.query(
          `SELECT s.student_id, s.enrollment_id, u.full_name AS student_name,
                  m.marks_id, m.marks_obtained, m.max_marks, m.grade, m.updated_at
           FROM enrollments e
           JOIN students s ON e.student_id = s.student_id
           JOIN users u ON s.user_id = u.user_id
           LEFT JOIN marks m ON m.course_id = $1 AND m.student_id = s.student_id
           WHERE e.course_id = $1
           ORDER BY s.enrollment_id ASC`,
          [selectedCourseId]
        );
        students = studentsRes.rows;
      }
    } else if (assignedCourses.length > 0) {
      // Default to first assigned course
      return res.redirect(`/academic/marks/entry?course_id=${assignedCourses[0].course_id}`);
    }

    res.render('academic/marks_entry', {
      title: 'Internal Marks Entry - UniConnect',
      courses: assignedCourses,
      selectedCourseId,
      currentCourse,
      students,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error loading marks entry:', err);
    res.render('academic/marks_entry', {
      title: 'Internal Marks Entry - UniConnect',
      courses: [],
      selectedCourseId: null,
      currentCourse: null,
      students: [],
      error: 'Failed to load marks entry data.',
      success: null
    });
  }
};

/**
 * Faculty: Save/Update Student Marks (AD-7 / D-3: Single Transaction with Audit Log)
 */
exports.postSaveMarks = async (req, res) => {
  const { facultyId, userId, role } = req.session.user;
  const { course_id, student_id, marks_obtained, max_marks } = req.body;

  if (!course_id || !student_id || marks_obtained === undefined || !max_marks) {
    return res.redirect(`/academic/marks/entry?course_id=${course_id}&error=Please+provide+all+marks+fields`);
  }

  const obtained = parseFloat(marks_obtained);
  const max = parseFloat(max_marks);

  if (isNaN(obtained) || isNaN(max) || obtained < 0 || max <= 0 || obtained > max) {
    return res.redirect(`/academic/marks/entry?course_id=${course_id}&error=Invalid+marks.+Must+be+between+0+and+max+marks`);
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Ownership check (D-4): Faculty can only enter marks for courses they teach
    const checkFaculty = await client.query(
      `SELECT 1 FROM course_faculty WHERE course_id = $1 AND faculty_id = $2`,
      [course_id, facultyId]
    );
    if (checkFaculty.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).send('Forbidden: You are not assigned to teach this course.');
    }

    // 2. Calculate grade automatically
    const grade = await calculateGrade(client, obtained, max);

    // 3. Check for existing marks record
    const existingRes = await client.query(
      `SELECT marks_id, marks_obtained, max_marks, grade FROM marks
       WHERE course_id = $1 AND student_id = $2`,
      [course_id, student_id]
    );

    let marksId;
    let isUpdate = false;
    let oldVal = null;

    if (existingRes.rows.length > 0) {
      // Update existing record
      isUpdate = true;
      marksId = existingRes.rows[0].marks_id;
      oldVal = `Marks: ${existingRes.rows[0].marks_obtained}/${existingRes.rows[0].max_marks} (Grade: ${existingRes.rows[0].grade})`;

      await client.query(
        `UPDATE marks
         SET marks_obtained = $1, max_marks = $2, grade = $3, updated_by = $4, updated_at = CURRENT_TIMESTAMP
         WHERE marks_id = $5`,
        [obtained, max, grade, userId, marksId]
      );
    } else {
      // Insert new record
      const insertRes = await client.query(
        `INSERT INTO marks (course_id, student_id, marks_obtained, max_marks, grade, updated_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         RETURNING marks_id`,
        [course_id, student_id, obtained, max, grade, userId]
      );
      marksId = insertRes.rows[0].marks_id;
    }

    const newVal = `Marks: ${obtained}/${max} (Grade: ${grade})`;

    // 4. Audit Log Write inside the exact same database transaction (AD-7)
    await client.query(
      `INSERT INTO audit_log (changed_by, marks_id, field_changed, old_value, new_value, changed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [userId, marksId, isUpdate ? 'marks_updated' : 'marks_created', oldVal, newVal]
    );

    await client.query('COMMIT');
    res.redirect(`/academic/marks/entry?course_id=${course_id}&success=Marks+saved+successfully.+Grade:+${grade}`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error saving marks in transaction:', err);
    res.redirect(`/academic/marks/entry?course_id=${course_id}&error=Failed+to+save+marks`);
  } finally {
    client.release();
  }
};

/**
 * Course Posts & Deadlines Feed (S-23)
 */
exports.getCoursePosts = async (req, res) => {
  const user = req.session.user;

  try {
    let queryText = '';
    let queryParams = [];

    if (user.role === 'Student') {
      // Students see posts for courses they are enrolled in
      queryText = `
        SELECT p.*, c.code AS course_code, c.name AS course_name, u.full_name AS faculty_name
        FROM course_posts p
        JOIN courses c ON p.course_id = c.course_id
        JOIN enrollments e ON c.course_id = e.course_id
        JOIN faculty f ON p.faculty_id = f.faculty_id
        JOIN users u ON f.user_id = u.user_id
        WHERE e.student_id = $1
        ORDER BY p.due_date ASC NULLS LAST, p.created_at DESC`;
      queryParams = [user.studentId];
    } else if (user.role === 'Faculty') {
      // Faculty see posts for courses they teach
      queryText = `
        SELECT p.*, c.code AS course_code, c.name AS course_name, u.full_name AS faculty_name
        FROM course_posts p
        JOIN courses c ON p.course_id = c.course_id
        JOIN course_faculty cf ON c.course_id = cf.course_id
        JOIN faculty f ON p.faculty_id = f.faculty_id
        JOIN users u ON f.user_id = u.user_id
        WHERE cf.faculty_id = $1
        ORDER BY p.due_date ASC NULLS LAST, p.created_at DESC`;
      queryParams = [user.facultyId];
    } else {
      // Admin sees all posts
      queryText = `
        SELECT p.*, c.code AS course_code, c.name AS course_name, u.full_name AS faculty_name
        FROM course_posts p
        JOIN courses c ON p.course_id = c.course_id
        JOIN faculty f ON p.faculty_id = f.faculty_id
        JOIN users u ON f.user_id = u.user_id
        ORDER BY p.due_date ASC NULLS LAST, p.created_at DESC`;
    }

    const result = await db.query(queryText, queryParams);
    const canCreate = ['Faculty', 'Admin'].includes(user.role);

    res.render('academic/course_posts', {
      title: 'Course Content & Deadlines - UniConnect',
      posts: result.rows,
      canCreate,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error('Error fetching course posts:', err);
    res.render('academic/course_posts', {
      title: 'Course Content & Deadlines - UniConnect',
      posts: [],
      canCreate: false,
      error: 'Failed to load course posts.',
      success: null
    });
  }
};

/**
 * Faculty: Render Create Course Post / Deadline Form
 */
exports.getCreatePostPage = async (req, res) => {
  const { facultyId, role } = req.session.user;

  try {
    let coursesQuery = '';
    let params = [];

    if (role === 'Admin') {
      coursesQuery = `SELECT course_id, code, name FROM courses ORDER BY code ASC`;
    } else {
      coursesQuery = `
        SELECT c.course_id, c.code, c.name
        FROM courses c
        JOIN course_faculty cf ON c.course_id = cf.course_id
        WHERE cf.faculty_id = $1
        ORDER BY c.code ASC`;
      params = [facultyId];
    }

    const coursesRes = await db.query(coursesQuery, params);

    res.render('academic/create_post', {
      title: 'Create Course Announcement / Deadline - UniConnect',
      courses: coursesRes.rows,
      error: null
    });
  } catch (err) {
    console.error('Error loading create post form:', err);
    res.redirect('/academic/posts?error=Failed+to+load+form');
  }
};

/**
 * Faculty: Submit New Course Post
 */
exports.postCreatePost = async (req, res) => {
  const { facultyId, role } = req.session.user;
  const { course_id, title, type, description, due_date } = req.body;

  if (!course_id || !title || !type || !description) {
    return res.redirect('/academic/posts/create?error=Please+fill+in+all+required+fields');
  }

  try {
    // Resolve faculty_id if Admin
    let resolvedFacultyId = facultyId;
    if (role === 'Admin') {
      const fRes = await db.query(`SELECT faculty_id FROM faculty LIMIT 1`);
      resolvedFacultyId = fRes.rows.length > 0 ? fRes.rows[0].faculty_id : 1;
    }

    await db.query(
      `INSERT INTO course_posts (course_id, faculty_id, title, type, description, due_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [course_id, resolvedFacultyId, title.trim(), type, description.trim(), due_date ? due_date : null]
    );

    res.redirect('/academic/posts?success=Course+post+published+successfully');
  } catch (err) {
    console.error('Error creating course post:', err);
    res.redirect('/academic/posts/create?error=Failed+to+create+post');
  }
};

/**
 * Delete Course Post
 */
exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM course_posts WHERE post_id = $1`, [id]);
    res.redirect('/academic/posts?success=Post+deleted+successfully');
  } catch (err) {
    console.error('Error deleting course post:', err);
    res.redirect('/academic/posts?error=Failed+to+delete+post');
  }
};
