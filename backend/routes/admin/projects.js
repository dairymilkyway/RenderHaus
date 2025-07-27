const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/projectController');
const { auth } = require('../../middleware/auth');

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

// Get project statistics (admin only) - must be before /:id route
router.get('/stats/overview', auth, adminOnly, projectController.getProjectStats);

// Get archived projects (admin only)
router.get('/archived', auth, adminOnly, projectController.getArchivedProjects);

// Get all projects (admin only)
router.get('/', auth, adminOnly, projectController.getAllProjects);

// Get project by ID (admin only)
router.get('/:id', auth, adminOnly, projectController.getProjectById);

// Update project (admin only)
router.put('/:id', auth, adminOnly, projectController.updateProject);

// Update project status (admin only)
router.patch('/:id/status', auth, adminOnly, projectController.updateProjectStatus);

// Archive project (admin only) - soft delete
router.patch('/:id/archive', auth, adminOnly, projectController.archiveProject);

// Restore archived project (admin only)
router.patch('/:id/restore', auth, adminOnly, projectController.restoreProject);

// Permanently delete project (admin only) - hard delete
router.delete('/:id', auth, adminOnly, projectController.deleteProject);

module.exports = router;
