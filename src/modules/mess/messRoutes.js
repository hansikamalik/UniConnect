const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const messController = require('./messController');
const { requireAuth } = require('../../middleware/auth');
const requireRole = require('../../middleware/requireRole');

// Multer storage for payment screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/mess_proofs'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `mess-proof-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeMatch = allowedTypes.test(file.mimetype);
    if (extMatch && mimeMatch) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPG, PNG, WEBP) and PDF are allowed.'));
  }
});

// Daily Menu routes (all authenticated users can view menu)
router.get('/menu', requireAuth, messController.getMenuView);

// Mess Admin Menu management
router.get('/menu/edit', requireAuth, requireRole(['Mess Admin', 'Admin']), messController.getEditMenuPage);
router.post('/menu/edit', requireAuth, requireRole(['Mess Admin', 'Admin']), messController.postEditMenu);

// Student Mess Subscription routes
router.get('/subscription', requireAuth, requireRole('Student'), messController.getStudentSubscriptionView);
router.post('/subscription', requireAuth, requireRole('Student'), upload.single('payment_proof'), messController.postSubmitSubscription);

// Mess Admin Subscription & Fee verification routes
router.get('/subscriptions/manage', requireAuth, requireRole(['Mess Admin', 'Admin']), messController.getAdminManageSubscriptions);
router.post('/subscriptions/:id/verify', requireAuth, requireRole(['Mess Admin', 'Admin']), messController.postVerifyPayment);
router.post('/subscriptions/cash', requireAuth, requireRole(['Mess Admin', 'Admin']), messController.postRecordCashPayment);

module.exports = router;
