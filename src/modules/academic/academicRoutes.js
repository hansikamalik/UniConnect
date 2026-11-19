const express = require('express');
const router = express.Router();
const academicController = require('./academicController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// Student Marks View (Student only)
router.get('/marks', requireAuth, requireRole('Student'), academicController.getStudentMarks);

// Faculty Marks Entry (Faculty & Admin)
router.get('/marks/entry', requireAuth, requireRole(['Faculty', 'Admin']), academicController.getMarksEntryPage);
router.post('/marks/save', requireAuth, requireRole(['Faculty', 'Admin']), academicController.postSaveMarks);

// Course Posts & Deadlines Feed (Student, Faculty, Admin)
router.get('/posts', requireAuth, academicController.getCoursePosts);
router.get('/posts/create', requireAuth, requireRole(['Faculty', 'Admin']), academicController.getCreatePostPage);
router.post('/posts/create', requireAuth, requireRole(['Faculty', 'Admin']), academicController.postCreatePost);
router.post('/posts/:id/delete', requireAuth, requireRole(['Faculty', 'Admin']), academicController.deletePost);

module.exports = router;
