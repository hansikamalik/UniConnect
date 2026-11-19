const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { requireGuest, requireAuth } = require('../../middleware/auth');

router.get('/login', requireGuest, authController.getLoginPage);
router.post('/login', requireGuest, authController.postLogin);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

// FR-10: Profile view for authenticated users
router.get('/profile', requireAuth, authController.getProfilePage);

// FR-35: Authenticated users can change their own password
router.get('/change-password', requireAuth, authController.getChangePasswordPage);
router.post('/change-password', requireAuth, authController.postChangePassword);

module.exports = router;
