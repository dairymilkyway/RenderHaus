const mongoose = require('mongoose');
const Model3D = require('./models/Model3D');
require('dotenv').config();

// Sample 3D models data for interior design
const sampleModels = [
  // FURNITURE - SEATING
  {
    name: "Modern Sofa",
    description: "Contemporary 3-seater sofa with clean lines and comfortable cushions",
    category: "furniture-seating",
    subcategory: "sofa",
    modelFile: {
      url: "https://example.com/models/modern-sofa.glb",
      format: "glb",
      size: 2048000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80", size: "small" },
      { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80", size: "medium" }
    ],
    dimensions: { width: 2.1, height: 0.8, depth: 0.9 },
    materials: [
      { name: "Fabric", color: "#808080", roughness: 0.8, metalness: 0.0 },
      { name: "Leather", color: "#654321", roughness: 0.3, metalness: 0.0 }
    ],
    placement: {
      canPlaceOn: ["floor"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "modern",
    tags: ["living room", "seating", "comfortable"],
    author: "Free3D",
    source: "Free3D.com",
    license: "CC0"
  },
  {
    name: "Office Chair",
    description: "Ergonomic office chair with adjustable height and lumbar support",
    category: "furniture-seating",
    subcategory: "chair",
    modelFile: {
      url: "https://example.com/models/office-chair.glb",
      format: "glb",
      size: 1024000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 0.65, height: 1.2, depth: 0.65 },
    materials: [
      { name: "Black Mesh", color: "#202020", roughness: 0.7, metalness: 0.0 },
      { name: "Chrome", color: "#CCCCCC", roughness: 0.1, metalness: 0.9 }
    ],
    placement: {
      canPlaceOn: ["floor"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "modern",
    tags: ["office", "ergonomic", "adjustable"],
    author: "Sketchfab",
    source: "Sketchfab.com",
    license: "CC-BY"
  },

  // FURNITURE - TABLES
  {
    name: "Dining Table",
    description: "Wooden dining table for 6 people with natural finish",
    category: "furniture-tables",
    subcategory: "dining-table",
    modelFile: {
      url: "https://example.com/models/dining-table.glb",
      format: "glb",
      size: 1536000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1549497538-303791108f95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 1.8, height: 0.75, depth: 0.9 },
    materials: [
      { name: "Oak Wood", color: "#8B4513", roughness: 0.6, metalness: 0.0 },
      { name: "Walnut", color: "#654321", roughness: 0.6, metalness: 0.0 }
    ],
    placement: {
      canPlaceOn: ["floor"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "traditional",
    tags: ["dining room", "wood", "family"],
    author: "TurboSquid",
    source: "TurboSquid.com",
    license: "Free"
  },
  {
    name: "Coffee Table",
    description: "Glass top coffee table with metal legs",
    category: "furniture-tables",
    subcategory: "coffee-table",
    modelFile: {
      url: "https://example.com/models/coffee-table.glb",
      format: "glb",
      size: 768000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 1.2, height: 0.4, depth: 0.6 },
    materials: [
      { name: "Clear Glass", color: "#F0F8FF", roughness: 0.1, metalness: 0.0 },
      { name: "Steel", color: "#708090", roughness: 0.2, metalness: 0.8 }
    ],
    placement: {
      canPlaceOn: ["floor"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "contemporary",
    tags: ["living room", "glass", "modern"],
    author: "CGTrader",
    source: "CGTrader.com",
    license: "CC0"
  },

  // LIGHTING
  {
    name: "Pendant Light",
    description: "Modern pendant light with Edison bulb",
    category: "lighting",
    subcategory: "pendant",
    modelFile: {
      url: "https://example.com/models/pendant-light.glb",
      format: "glb",
      size: 512000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 0.3, height: 0.4, depth: 0.3 },
    materials: [
      { name: "Copper", color: "#B87333", roughness: 0.3, metalness: 0.8 },
      { name: "Black Metal", color: "#2F2F2F", roughness: 0.4, metalness: 0.7 }
    ],
    placement: {
      canPlaceOn: ["ceiling"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "industrial",
    tags: ["lighting", "edison", "hanging"],
    author: "Free3D",
    source: "Free3D.com",
    license: "CC0"
  },
  {
    name: "Floor Lamp",
    description: "Minimalist floor lamp with fabric shade",
    category: "lighting",
    subcategory: "floor-lamp",
    modelFile: {
      url: "https://example.com/models/floor-lamp.glb",
      format: "glb",
      size: 1024000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 0.4, height: 1.6, depth: 0.4 },
    materials: [
      { name: "White Fabric", color: "#FFFFFF", roughness: 0.8, metalness: 0.0 },
      { name: "Wood Base", color: "#8B4513", roughness: 0.6, metalness: 0.0 }
    ],
    placement: {
      canPlaceOn: ["floor"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "scandinavian",
    tags: ["lighting", "minimalist", "ambient"],
    author: "Sketchfab",
    source: "Sketchfab.com",
    license: "CC-BY"
  },

  // APPLIANCES
  {
    name: "Refrigerator",
    description: "Modern stainless steel refrigerator with ice dispenser",
    category: "appliances",
    subcategory: "refrigerator",
    modelFile: {
      url: "https://example.com/models/refrigerator.glb",
      format: "glb",
      size: 3072000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 0.7, height: 1.8, depth: 0.7 },
    materials: [
      { name: "Stainless Steel", color: "#C0C0C0", roughness: 0.2, metalness: 0.9 },
      { name: "White", color: "#FFFFFF", roughness: 0.3, metalness: 0.0 }
    ],
    placement: {
      canPlaceOn: ["floor"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: false
    },
    style: "modern",
    tags: ["kitchen", "appliance", "stainless"],
    author: "TurboSquid",
    source: "TurboSquid.com",
    license: "Free"
  },

  // DECORATIVE
  {
    name: "Wall Art",
    description: "Abstract wall art in modern frame",
    category: "decorative",
    subcategory: "wall-art",
    modelFile: {
      url: "https://example.com/models/wall-art.glb",
      format: "glb",
      size: 256000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 0.8, height: 0.6, depth: 0.05 },
    materials: [
      { name: "Canvas", color: "#F5F5DC", roughness: 0.9, metalness: 0.0 },
      { name: "Black Frame", color: "#000000", roughness: 0.3, metalness: 0.0 }
    ],
    placement: {
      canPlaceOn: ["wall"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: true
    },
    style: "contemporary",
    tags: ["art", "decoration", "wall"],
    author: "CGTrader",
    source: "CGTrader.com",
    license: "CC0"
  },

  // PLANTS
  {
    name: "Potted Plant",
    description: "Indoor plant in ceramic pot - perfect for any room",
    category: "plants",
    subcategory: "indoor-plant",
    modelFile: {
      url: "https://example.com/models/potted-plant.glb",
      format: "glb",
      size: 1536000
    },
    thumbnails: [
      { url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", size: "small" }
    ],
    dimensions: { width: 0.4, height: 0.8, depth: 0.4 },
    materials: [
      { name: "Green Leaves", color: "#228B22", roughness: 0.7, metalness: 0.0 },
      { name: "Ceramic Pot", color: "#8B7D6B", roughness: 0.4, metalness: 0.0 }
    ],
    placement: {
      canPlaceOn: ["floor", "table", "shelf"],
      snapsToGrid: true,
      allowRotation: true,
      allowScaling: true
    },
    style: "modern",
    tags: ["plant", "green", "nature", "indoor"],
    author: "Free3D",
    source: "Free3D.com",
    license: "CC0"
  }
];

async function populateModels() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/renderhaus');
    console.log('Connected to MongoDB');

    // Clear existing models (optional)
    // await Model3D.deleteMany({});
    // console.log('Cleared existing models');

    // Insert sample models
    const insertedModels = await Model3D.insertMany(sampleModels);
    console.log(`Inserted ${insertedModels.length} 3D models`);

    console.log('Sample models added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating models:', error);
    process.exit(1);
  }
}

// Run the script
populateModels();
