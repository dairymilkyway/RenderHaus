const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', modelController.getModels);
router.get('/categories', modelController.getCategories);
router.get('/categories/:category/subcategories', modelController.getSubcategories);
router.get('/:id', modelController.getModelById);

// Admin only routes
router.post('/', auth, modelController.createModel);
router.put('/:id', auth, modelController.updateModel);
router.delete('/:id', auth, modelController.deleteModel);

// File upload routes (Admin only)
router.post('/upload', auth, modelController.upload.single('modelFile'), modelController.uploadModelFile);
router.put('/:id/upload', auth, modelController.upload.single('modelFile'), modelController.updateModelFile);

module.exports = router;
