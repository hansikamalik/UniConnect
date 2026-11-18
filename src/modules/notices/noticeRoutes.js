const express = require('express');
const router = express.Router();
const noticeController = require('./noticeController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// All authenticated users can view notices
router.get('/', requireAuth, noticeController.getAllNotices);

// Create notice (Admin, Faculty, Warden, Mess Admin only)
router.get(
  '/create',
  requireAuth,
  requireRole(['Admin', 'Faculty', 'Warden', 'Mess Admin']),
  noticeController.getCreateNoticePage
);

router.post(
  '/create',
  requireAuth,
  requireRole(['Admin', 'Faculty', 'Warden', 'Mess Admin']),
  noticeController.postCreateNotice
);

// View individual notice
router.get('/:id', requireAuth, noticeController.getNoticeById);

// Delete notice
router.post('/:id/delete', requireAuth, noticeController.deleteNotice);

module.exports = router;
