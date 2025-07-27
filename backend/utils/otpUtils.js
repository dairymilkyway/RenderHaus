const crypto = require('crypto');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a secure random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash OTP for secure storage
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Verify OTP
const verifyOTP = (inputOTP, hashedOTP) => {
  const hashedInput = crypto.createHash('sha256').update(inputOTP).digest('hex');
  return hashedInput === hashedOTP;
};

module.exports = {
  generateOTP,
  generateToken,
  hashOTP,
  verifyOTP
};
