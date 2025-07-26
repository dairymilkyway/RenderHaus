const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'living-room',
      'bedroom',
      'kitchen',
      'bathroom',
      'dining-room',
      'home-office',
      'guest-room',
      'walk-in-closet',
      'laundry-room',
      'garage',
      'basement',
      'attic'
    ]
  },
  // Room dimensions and layout
  layout: {
    width: { type: Number, required: true }, // in meters
    length: { type: Number, required: true },
    height: { type: Number, default: 2.4 }, // standard ceiling height
    
    // Wall definitions
    walls: [{
      id: String,
      startPoint: { x: Number, y: Number },
      endPoint: { x: Number, y: Number },
      thickness: { type: Number, default: 0.15 }, // 15cm standard
      height: { type: Number, default: 2.4 },
      material: {
        interior: String, // material ID for interior side
        exterior: String  // material ID for exterior side
      }
    }],
    
    // Openings in walls (doors, windows)
    openings: [{
      wallId: String,
      type: { type: String, enum: ['door', 'window', 'archway'] },
      position: { type: Number }, // distance from wall start (0-1)
      width: Number,
      height: Number,
      modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model3D' }
    }],
    
    // Floor definition
    floor: {
      material: String, // material ID
      elevation: { type: Number, default: 0 }
    },
    
    // Ceiling definition  
    ceiling: {
      material: String,
      height: { type: Number, default: 2.4 },
      type: { type: String, enum: ['flat', 'vaulted', 'tray', 'coffered'], default: 'flat' }
    }
  },
  
  // Pre-placed furniture/fixtures
  fixtures: [{
    modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model3D' },
    position: {
      x: Number,
      y: Number, 
      z: Number
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
    isFixed: { type: Boolean, default: false } // Can user move this?
  }],
  
  // Room style and ambiance
  style: {
    type: String,
    enum: ['modern', 'traditional', 'contemporary', 'minimalist', 'rustic', 'industrial', 'scandinavian', 'vintage', 'luxury']
  },
  
  // Lighting setup
  lighting: {
    natural: [{
      type: { type: String, enum: ['window', 'skylight', 'door'] },
      intensity: { type: Number, default: 1.0 },
      direction: String // 'north', 'south', 'east', 'west'
    }],
    artificial: [{
      modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model3D' },
      type: { type: String, enum: ['ambient', 'task', 'accent'] },
      intensity: { type: Number, default: 1.0 },
      color: { type: String, default: '#ffffff' }
    }]
  },
  
  // Preview and metadata
  thumbnail: String,
  tags: [String],
  isTemplate: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  
  // File storage fields (for 3D model files)
  modelFile: {
    url: String,
    format: String,
    size: Number
  },
  uploadcareId: String,
  fileName: String,
  fileSize: Number,
  fileFormat: String,
  description: String
});

module.exports = mongoose.model('Room', roomSchema);
