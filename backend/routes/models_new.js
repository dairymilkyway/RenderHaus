const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
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

// Admin stats route - must be before other routes
router.get('/stats/overview', auth, adminOnly, modelController.getModelStats);

// Public routes
router.get('/', modelController.getModels);
router.get('/categories', modelController.getCategories);
router.get('/categories/:category/subcategories', modelController.getSubcategories);
router.get('/:id', modelController.getModelById);

// Admin only routes
router.post('/', auth, adminOnly, modelController.createModel);
router.put('/:id', auth, adminOnly, modelController.updateModel);
router.delete('/:id', auth, adminOnly, modelController.deleteModel);

// File upload routes (Admin only)
router.post('/upload', auth, adminOnly, modelController.upload.single('modelFile'), modelController.uploadModelFile);
router.put('/:id/upload', auth, adminOnly, modelController.upload.single('modelFile'), modelController.updateModelFile);

module.exports = router;
