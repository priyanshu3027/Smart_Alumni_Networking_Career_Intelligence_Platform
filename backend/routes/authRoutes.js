const express = require('express');
const router = express.Router();
const { register, login, verify2FA, setup2FA, enable2FA, disable2FA, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.get('/me', protect, getMe);
router.post('/setup-2fa', protect, setup2FA);
router.post('/enable-2fa', protect, enable2FA);
router.post('/disable-2fa', protect, disable2FA);

module.exports = router;
