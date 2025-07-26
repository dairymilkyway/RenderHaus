const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['interior', 'exterior', 'mixed']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'living-room',
      'bedroom',
      'kitchen',
      'bathroom',
      'office',
      'dining-room',
      'outdoor-patio',
      'garden',
      'facade',
      'full-house'
    ]
  },
  // Room/space dimensions
  dimensions: {
    width: { type: Number, required: true }, // in meters
    height: { type: Number, required: true },
    depth: { type: Number, required: true }
  },
  // Default objects in the template
  defaultObjects: [{
    model3DId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model3D',
      required: true
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true }
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 }
    },
    material: {
      color: String,
      texture: String
    }
  }],
  // Environment settings
  environment: {
    lighting: {
      type: String,
      enum: ['natural', 'warm', 'cool', 'dramatic'],
      default: 'natural'
    },
    backgroundColor: {
      type: String,
      default: '#f0f0f0'
    },
    ambientColor: {
      type: String,
      default: '#404040'
    }
  },
  // Style information
  style: {
    type: String,
    enum: ['modern', 'traditional', 'contemporary', 'minimalist', 'rustic', 'industrial', 'scandinavian', 'vintage', 'luxury']
  },
  // Preview images
  thumbnails: [{
    url: String,
    size: {
      type: String,
      enum: ['small', 'medium', 'large']
    }
  }],
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
templateSchema.index({ type: 1, category: 1 });
templateSchema.index({ style: 1 });
templateSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Template', templateSchema);
