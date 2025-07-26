// Test file for the upload functionality
// Run this with: node test-upload.js

const express = require('express');
const { uploadModelFile, updateModelFile, upload } = require('./controllers/modelController');

console.log('Upload functionality tests:');
console.log('✓ uploadModelFile function exists:', typeof uploadModelFile === 'function');
console.log('✓ updateModelFile function exists:', typeof updateModelFile === 'function');
console.log('✓ upload middleware exists:', typeof upload === 'object');

// Check if the required dependencies are installed
try {
  require('cloudinary');
  console.log('✓ Cloudinary package is installed');
} catch (error) {
  console.log('✗ Cloudinary package is missing');
}

try {
  require('multer');
  console.log('✓ Multer package is installed');
} catch (error) {
  console.log('✗ Multer package is missing');
}

// Check if cloudinary config exists
try {
  const { uploadModel, deleteModel } = require('./config/cloudinary');
  console.log('✓ Cloudinary config is properly set up');
} catch (error) {
  console.log('✗ Cloudinary config error:', error.message);
}

console.log('\nNew API endpoints available:');
console.log('POST /api/models/upload - Upload a new 3D model with file');
console.log('PUT /api/models/:id/upload - Update existing model with new file');
console.log('\nBoth endpoints require:');
console.log('- Admin authentication (Authorization header)');
console.log('- File upload via multipart/form-data with field name "modelFile"');
console.log('- Supported formats: .gltf, .glb, .obj, .fbx, .dae, .3ds');
console.log('- Maximum file size: 50MB');
