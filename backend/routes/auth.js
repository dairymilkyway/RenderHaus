const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  registerValidation, 
  loginValidation, 
  verifyEmailValidation, 
  resendOTPValidation 
} = require('../middleware/validators');
const { auth } = require('../middleware/auth');

// Auth routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/verify-email', verifyEmailValidation, authController.verifyEmail);
router.post('/resend-otp', resendOTPValidation, authController.resendVerificationOTP);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', auth, authController.getProfile);

module.exports = router; 