const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      next();
    } catch (error) {
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