const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { requireGuest } = require('../../middleware/auth');

router.get('/login', requireGuest, authController.getLoginPage);
router.post('/login', requireGuest, authController.postLogin);
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
