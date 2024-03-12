const express = require('express');

const router = express.Router();

const { register, login, logout, verifyEmail, regenerateToken } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/verify-email', verifyEmail)
router.post('/resend-verify-email', regenerateToken)

module.exports = router;