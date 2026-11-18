const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// All admin routes strictly require Admin role
router.use(requireAuth, requireRole('Admin'));

// User Management
router.get('/users', adminController.getUsersList);
router.get('/users/create', adminController.getCreateUserPage);
router.post('/users/create', adminController.postCreateUser);
router.post('/users/:id/toggle-status', adminController.postToggleUserStatus);

// Course Management & Assignments
router.get('/courses', adminController.getCoursesManagement);
router.post('/courses/create', adminController.postCreateCourse);
router.post('/courses/assign-faculty', adminController.postAssignFaculty);
router.post('/courses/enroll-student', adminController.postEnrollStudent);

// Audit Trail Inspector
router.get('/audit', adminController.getAuditLog);

module.exports = router;
