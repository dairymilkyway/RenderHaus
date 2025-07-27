const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');
const { AuthenticationError, NotFoundError } = require('../utils/errors');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpUtils');
const { sendEmail } = require('../config/mailer');

// Generate tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, gender } = req.body;

    // Check if user already exists (including soft-deleted users)
    const existingUser = await User.findOne({ email });
    if (existingUser && !existingUser.deletedAt) {
      throw new AuthenticationError('User already exists');
    }
    
    // If a soft-deleted user exists, restore it instead of creating new
    if (existingUser && existingUser.deletedAt) {
      // Generate OTP
      const otp = generateOTP();
      const hashedOTP = hashOTP(otp);
      const otpExpiry = new Date(Date.now() + config.email.otpExpiry);

      // Restore the soft-deleted user
      existingUser.name = name;
      existingUser.password = password; // This will trigger the pre-save hash
      existingUser.gender = gender;
      existingUser.isActive = true;
      existingUser.deletedAt = null;
      existingUser.isEmailVerified = false;
      existingUser.emailVerificationOTP = hashedOTP;
      existingUser.emailVerificationExpires = otpExpiry;

      await existingUser.save();
      logger.info(`Restored soft-deleted user during registration: ${existingUser.email}`);

      // Send verification email
      const emailResult = await sendEmail(email, 'verificationOTP', name, otp);
      
      if (!emailResult.success) {
        logger.error(`Failed to send verification email to ${email}: ${emailResult.error}`);
      }

      return res.status(201).json({
        status: 'success',
        message: 'Registration successful. Please check your email for verification code.',
        data: {
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            gender: existingUser.gender,
            isEmailVerified: existingUser.isEmailVerified
          },
          emailSent: emailResult.success
        }
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + config.email.otpExpiry);

    // Create new user
    const user = new User({
      name,
      email,
      password,
      gender,
      emailVerificationOTP: hashedOTP,
      emailVerificationExpires: otpExpiry
    });

    await user.save();
    logger.info(`New user registered: ${user.email}`);

    // Send verification email
    const emailResult = await sendEmail(email, 'verificationOTP', name, otp);
    
    if (!emailResult.success) {
      logger.error(`Failed to send verification email to ${email}: ${emailResult.error}`);
      // Don't throw error here, user is created but email failed
    }

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          isEmailVerified: user.isEmailVerified
        },
        emailSent: emailResult.success
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and ensure they are not soft-deleted
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new AuthenticationError('Please verify your email before logging in. Check your inbox for the verification code.');
    }

    logger.info(`User logged in: ${user.email}`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);
    
    // Check if user still exists and is not soft-deleted
    const user = await User.findOne({ _id: decoded.userId, deletedAt: null });
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    // Generate new tokens
    const tokens = generateTokens(user._id, user.role);

    res.json({
      status: 'success',
      data: {
        tokens
      }
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid refresh token'));
    } else {
      next(error);
    }
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.userId, deletedAt: null }).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find user by email and ensure they are not soft-deleted
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.json({
        status: 'success',
        message: 'Email is already verified'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
      throw new AuthenticationError('No verification code found. Please request a new one.');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new AuthenticationError('Verification code has expired. Please request a new one.');
    }

    // Verify OTP
    const isValidOTP = verifyOTP(otp, user.emailVerificationOTP);
    if (!isValidOTP) {
      throw new AuthenticationError('Invalid verification code');
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    // Generate tokens for immediate login
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.json({
      status: 'success',
      message: 'Email verified successfully! You can now login.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          gender: user.gender,
          isEmailVerified: user.isEmailVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification OTP
exports.resendVerificationOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email and ensure they are not soft-deleted
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.json({
        status: 'success',
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + config.email.otpExpiry);

    // Update user with new OTP
    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationExpires = otpExpiry;
    await user.save();

    // Send verification email
    const emailResult = await sendEmail(email, 'verificationOTP', user.name, otp);
    
    if (!emailResult.success) {
      logger.error(`Failed to resend verification email to ${email}: ${emailResult.error}`);
      throw new Error('Failed to send verification email. Please try again.');
    }

    logger.info(`Verification OTP resent to: ${user.email}`);

    res.json({
      status: 'success',
      message: 'Verification code sent to your email',
      data: {
        emailSent: true
      }
    });
  } catch (error) {
    next(error);
  }
}; 