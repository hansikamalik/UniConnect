const express = require('express');
const router = express.Router();
const academicController = require('./academicController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// Student Marks View (Student only)
router.get('/marks', requireAuth, requireRole('Student'), academicController.getStudentMarks);

// Faculty Marks Entry (Faculty only per Permission Matrix FR-8)
router.get('/marks/entry', requireAuth, requireRole('Faculty'), academicController.getMarksEntryPage);
router.post('/marks/save', requireAuth, requireRole('Faculty'), academicController.postSaveMarks);

// Course Posts & Deadlines Feed (All can view; Faculty creates/deletes per Permission Matrix FR-36)
router.get('/posts', requireAuth, academicController.getCoursePosts);
router.get('/posts/create', requireAuth, requireRole('Faculty'), academicController.getCreatePostPage);
router.post('/posts/create', requireAuth, requireRole('Faculty'), academicController.postCreatePost);
router.post('/posts/:id/delete', requireAuth, requireRole('Faculty'), academicController.deletePost);

module.exports = router;
