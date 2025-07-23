const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Get user statistics (admin only) - must be before /:id route
router.get('/stats/overview', auth, adminOnly, userController.getUserStats);

// Get all users (admin only)
router.get('/', auth, adminOnly, userController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', auth, adminOnly, userController.getUserById);

// Update user (admin only)
router.put('/:id', auth, adminOnly, userController.updateUser);

// Deactivate/activate user (admin only)
router.patch('/:id/status', auth, adminOnly, userController.toggleUserStatus);

// Delete user (admin only)
router.delete('/:id', auth, adminOnly, userController.deleteUser);

module.exports = router;
