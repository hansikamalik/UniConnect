const express = require('express');
const router = express.Router();
const hostelController = require('./hostelController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// Student routes
router.get('/complaints', requireAuth, requireRole('Student'), hostelController.getStudentComplaints);
router.get('/complaints/new', requireAuth, requireRole('Student'), hostelController.getNewComplaintPage);
router.post('/complaints/new', requireAuth, requireRole('Student'), hostelController.postNewComplaint);

// Warden & Admin management routes
router.get('/complaints/manage', requireAuth, requireRole(['Warden', 'Admin']), hostelController.getWardenManageComplaints);
router.post('/complaints/:id/status', requireAuth, requireRole(['Warden', 'Admin']), hostelController.postUpdateComplaintStatus);

module.exports = router;
