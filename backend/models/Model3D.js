const mongoose = require('mongoose');

const model3DSchema = new mongoose.Schema({
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
    url: { type: String }, // URL to the 3D model file (for seeded models)
    format: { 
      type: String, 
      enum: ['gltf', 'glb', 'fbx', 'obj', 'dae']
    },
    size: Number, // File size in bytes
  },
  
  // New Uploadcare fields (for uploaded models)
  fileUrl: String, // Direct file URL from Uploadcare
  uploadcareId: String, // Uploadcare file UUID
  fileName: String, // Original file name
  fileSize: Number, // File size in bytes
  fileFormat: String, // File extension
  // Preview images
  thumbnails: [{
    url: String,
    size: {
      type: String,
      enum: ['small', 'medium', 'large']
    }
  }],
  thumbnail: String, // URL to single manually uploaded thumbnail image
  // Physical properties
  dimensions: {
    width: { type: Number, required: true }, // in meters
    height: { type: Number, required: true },
    depth: { type: Number, required: true }
  },
  // Material and color options
  materials: {
    type: mongoose.Schema.Types.Mixed, // Allow both array and string
    default: []
  },
  // Placement rules
  placement: {
    canPlaceOn: [{
      type: String,
      enum: ['floor', 'wall', 'ceiling', 'table', 'shelf', 'outdoor']
    }],
    snapsToGrid: { type: Boolean, default: true },
    allowRotation: { type: Boolean, default: true },
    allowScaling: { type: Boolean, default: false }
  },
  // Style and tags
  style: {
    type: String,
    enum: ['modern', 'traditional', 'contemporary', 'minimalist', 'rustic', 'industrial', 'scandinavian', 'vintage', 'luxury']
  },
  tags: [String],
  
  // Room type (for room templates)
  roomType: {
    type: String,
    enum: ['living-room', 'bedroom', 'kitchen', 'bathroom', 'dining-room', 'home-office', 'guest-room', 'walk-in-closet', 'laundry-room', 'garage', 'basement', 'attic']
  },
  // Pricing (if applicable)
  price: {
    type: Number,
    default: 0 // 0 for free models
  },
  // Usage tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  // Metadata
  author: String,
  source: String, // Where the model came from
  license: {
    type: String,
    enum: ['CC0', 'CC-BY', 'CC-BY-SA', 'Free', 'Commercial']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
model3DSchema.index({ category: 1, subcategory: 1 });
model3DSchema.index({ style: 1 });
model3DSchema.index({ tags: 1 });
model3DSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Model3D', model3DSchema);
