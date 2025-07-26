const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log('=== Auth Middleware Debug ===');
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token ? `${token.substring(0, 20)}...` : 'No token');

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      console.log('Token verified successfully for user:', decoded.userId);
      req.user = decoded;
      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError('Not authorized to access this route'));
    }
    next();
  };
}; 