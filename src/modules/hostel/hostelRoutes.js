const express = require('express');
const router = express.Router();
const hostelController = require('./hostelController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// Student routes
router.get('/complaints', requireAuth, requireRole('Student'), hostelController.getStudentComplaints);
router.get('/complaints/new', requireAuth, requireRole('Student'), hostelController.getNewComplaintPage);
router.post('/complaints/new', requireAuth, requireRole('Student'), hostelController.postNewComplaint);

// Warden management routes (Warden only per Permission Matrix FR-12 to FR-15)
router.get('/complaints/manage', requireAuth, requireRole('Warden'), hostelController.getWardenManageComplaints);
router.post('/complaints/:id/status', requireAuth, requireRole('Warden'), hostelController.postUpdateComplaintStatus);

module.exports = router;
