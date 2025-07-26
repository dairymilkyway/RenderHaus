const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'furniture',
      'furniture-seating',
      'furniture-tables',
      'furniture-storage',
      'furniture-beds',
      'lighting',
      'appliances',
      'decorative',
      'plants',
      'architectural-doors',
      'architectural-windows',
      'architectural-stairs',
      'flooring',
      'walls',
      'ceilings',
      'exterior-landscaping',
      'exterior-structures'
    ]
  },
  subcategory: {
    type: String,
    required: true
  },
  // Model file information
  modelFile: {
    url: { type: String }, // URL to the 3D model file
    format: { 
      type: String, 
      enum: ['gltf', 'glb', 'fbx', 'obj', 'dae']
    },
    size: Number, // File size in bytes
  },
  
  // Uploadcare fields (for uploaded models)
  fileUrl: String, // Direct URL from Uploadcare
  uploadcareId: String, // Uploadcare file ID for management
  fileName: String, // Original filename
  fileSize: Number, // File size in bytes
  fileFormat: String, // File format (glb, gltf, etc.)
  
  // Component properties
  style: {
    type: String,
    enum: ['modern', 'traditional', 'minimalist', 'industrial', 'rustic', 'contemporary'],
    default: 'modern'
  },
  tags: [String],
  dimensions: {
    width: { type: Number, default: 1 },
    height: { type: Number, default: 1 },
    depth: { type: Number, default: 1 }
  },
  materials: [String],
  compatibility: [String], // Compatible platforms/formats
  
  // Metadata
  thumbnail: String, // URL to thumbnail image
  downloadCount: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  isActive: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Text search index
componentSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});

// Category and style indexes for filtering
componentSchema.index({ category: 1, style: 1 });
componentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Component', componentSchema);
