const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  preview: {
    type: String, // Base64 encoded image data
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Template used as base (optional)
  baseTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  // Project type
  type: {
    type: String,
    required: true,
    enum: ['interior', 'exterior', 'mixed']
  },
  // Scene dimensions
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    depth: { type: Number, required: true }
  },
  // Objects placed in the scene
  objects: [{
    // Dynamic reference that can point to either Model3D or Component
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'objects.modelType'
    },
    // Indicates which collection this model comes from
    modelType: {
      type: String,
      required: true,
      enum: ['Model3D', 'Component']
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
    // Custom material/color applied to this instance
    customMaterial: {
      color: String,
      texture: String,
      roughness: Number,
      metalness: Number
    },
    // Unique identifier for this object instance
    instanceId: {
      type: String,
      required: true
    }
  }],
  // Camera settings
  camera: {
    position: {
      x: { type: Number, default: 5 },
      y: { type: Number, default: 5 },
      z: { type: Number, default: 5 }
    },
    target: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    }
  },
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
  // Project status
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'shared'],
    default: 'draft'
  },
  // Sharing settings
  isPublic: {
    type: Boolean,
    default: false
  },
  shareLink: {
    type: String,
    unique: true,
    sparse: true
  },
  // Preview images/snapshots
  snapshots: [{
    url: String,
    name: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Version control
  version: {
    type: Number,
    default: 1
  },
  // Metadata
  tags: [String],
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Soft delete field for archiving
  deletedAt: {
    type: Date,
    default: null
  }
});

// Update lastModified when project is saved
projectSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Index for better query performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Project', projectSchema);
