const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');
const { AuthenticationError, NotFoundError } = require('../utils/errors');

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
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AuthenticationError('User already exists');
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();
    logger.info(`New user registered: ${user.email}`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
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

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials');
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
          role: user.role
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
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
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
    const user = await User.findById(req.user.userId).select('-password');
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