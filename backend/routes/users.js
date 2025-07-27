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

// Get archived users (admin only)
router.get('/archived', auth, adminOnly, userController.getArchivedUsers);

// Get all users (admin only)
router.get('/', auth, adminOnly, userController.getAllUsers);

// Create new user (admin only)
router.post('/', auth, adminOnly, userController.createUser);

// Get user by ID (admin only)
router.get('/:id', auth, adminOnly, userController.getUserById);

// Update user (admin only)
router.put('/:id', auth, adminOnly, userController.updateUser);

// Deactivate/activate user (admin only)
router.patch('/:id/status', auth, adminOnly, userController.toggleUserStatus);

// Archive user (admin only) - soft delete
router.delete('/:id', auth, adminOnly, userController.deleteUser);

// Restore archived user (admin only)
router.patch('/:id/restore', auth, adminOnly, userController.restoreUser);

// Permanently delete user (admin only) - hard delete
router.delete('/:id/permanent', auth, adminOnly, userController.permanentlyDeleteUser);

module.exports = router;
