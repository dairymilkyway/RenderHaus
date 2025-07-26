const mongoose = require('mongoose');

const houseTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // House specifications
  specifications: {
    totalArea: Number, // square meters
    bedrooms: Number,
    bathrooms: Number,
    floors: { type: Number, default: 1 },
    garageSpaces: { type: Number, default: 0 }
  },
  
  // Floor plans
  floors: [{
    level: Number, // 0=ground, 1=first floor, -1=basement
    elevation: Number, // height from ground level
    
    // Rooms on this floor
    rooms: [{
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      position: {
        x: Number, // position in house coordinate system
        y: Number,
        z: Number
      },
      // Allow room customization in this template
      customizations: {
        canResize: { type: Boolean, default: false },
        canMove: { type: Boolean, default: false },
        canReplace: { type: Boolean, default: true }
      }
    }],
    
    // Connecting elements (hallways, stairs)
    connections: [{
      type: { type: String, enum: ['hallway', 'staircase', 'elevator'] },
      path: [{ x: Number, y: Number }], // path coordinates
      width: { type: Number, default: 1.2 } // hallway width
    }]
  }],
  
  // Exterior elements
  exterior: {
    style: {
      type: String,
      enum: ['modern', 'traditional', 'contemporary', 'colonial', 'craftsman', 'ranch', 'tudor']
    },
    
    // Exterior walls and facade
    facade: [{
      wall: String, // 'front', 'back', 'left', 'right'
      material: String,
      features: [{ // windows, doors, decorative elements
        type: String,
        modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model3D' },
        position: { x: Number, y: Number, z: Number }
      }]
    }],
    
    // Landscaping elements
    landscaping: [{
      type: { type: String, enum: ['tree', 'bush', 'flower', 'path', 'driveway', 'fence'] },
      modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Model3D' },
      position: { x: Number, y: Number, z: Number }
    }]
  },
  
  // Template metadata
  category: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'townhouse', 'studio', 'loft']
  },
  
  priceRange: {
    type: String,
    enum: ['budget', 'mid-range', 'luxury', 'ultra-luxury']
  },
  
  tags: [String],
  thumbnail: String,
  images: [String], // multiple preview images
  
  // Template usage
  isPublic: { type: Boolean, default: true },
  downloadCount: { type: Number, default: 0 },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HouseTemplate', houseTemplateSchema);
