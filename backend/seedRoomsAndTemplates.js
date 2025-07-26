const mongoose = require('mongoose');
const Room = require('./models/Room');
const HouseTemplate = require('./models/HouseTemplate');
const Model3D = require('./models/Model3D');
require('dotenv').config();

// Sample room templates
const sampleRooms = [
  {
    name: "Modern Living Room",
    type: "living-room",
    layout: {
      width: 5.0,
      length: 6.0,
      height: 2.7,
      walls: [
        {
          id: "wall1",
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 6, y: 0 },
          thickness: 0.15,
          height: 2.7,
          material: { interior: "white-paint", exterior: "white-paint" }
        },
        {
          id: "wall2", 
          startPoint: { x: 6, y: 0 },
          endPoint: { x: 6, y: 5 },
          thickness: 0.15,
          height: 2.7,
          material: { interior: "white-paint", exterior: "white-paint" }
        },
        {
          id: "wall3",
          startPoint: { x: 6, y: 5 },
          endPoint: { x: 0, y: 5 },
          thickness: 0.15,
          height: 2.7,
          material: { interior: "white-paint", exterior: "white-paint" }
        },
        {
          id: "wall4",
          startPoint: { x: 0, y: 5 },
          endPoint: { x: 0, y: 0 },
          thickness: 0.15,
          height: 2.7,
          material: { interior: "white-paint", exterior: "white-paint" }
        }
      ],
      openings: [
        {
          wallId: "wall1",
          type: "window",
          position: 0.5,
          width: 1.5,
          height: 1.2
        },
        {
          wallId: "wall4",
          type: "door", 
          position: 0.2,
          width: 0.9,
          height: 2.1
        }
      ],
      floor: {
        material: "hardwood-oak",
        elevation: 0
      },
      ceiling: {
        material: "white-paint",
        height: 2.7,
        type: "flat"
      }
    },
    style: "modern",
    lighting: {
      natural: [{
        type: "window",
        intensity: 1.0,
        direction: "south"
      }],
      artificial: [{
        type: "ambient",
        intensity: 0.8,
        color: "#ffffff"
      }]
    },
    tags: ["spacious", "bright", "entertainment", "family"],
    isTemplate: true
  },
  
  {
    name: "Master Bedroom",
    type: "bedroom",
    layout: {
      width: 4.0,
      length: 5.0, 
      height: 2.4,
      walls: [
        {
          id: "wall1",
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 5, y: 0 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "beige-paint", exterior: "beige-paint" }
        },
        {
          id: "wall2",
          startPoint: { x: 5, y: 0 },
          endPoint: { x: 5, y: 4 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "beige-paint", exterior: "beige-paint" }
        },
        {
          id: "wall3", 
          startPoint: { x: 5, y: 4 },
          endPoint: { x: 0, y: 4 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "beige-paint", exterior: "beige-paint" }
        },
        {
          id: "wall4",
          startPoint: { x: 0, y: 4 },
          endPoint: { x: 0, y: 0 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "beige-paint", exterior: "beige-paint" }
        }
      ],
      openings: [
        {
          wallId: "wall1",
          type: "window",
          position: 0.3,
          width: 1.2,
          height: 1.0
        },
        {
          wallId: "wall1", 
          type: "window",
          position: 0.7,
          width: 1.2,
          height: 1.0
        },
        {
          wallId: "wall4",
          type: "door",
          position: 0.9,
          width: 0.8,
          height: 2.0
        }
      ],
      floor: {
        material: "carpet-beige",
        elevation: 0
      },
      ceiling: {
        material: "white-paint",
        height: 2.4,
        type: "flat"
      }
    },
    style: "contemporary",
    lighting: {
      natural: [{
        type: "window",
        intensity: 0.8,
        direction: "east"
      }],
      artificial: [{
        type: "ambient",
        intensity: 0.6,
        color: "#fff8dc"
      }]
    },
    tags: ["cozy", "relaxing", "private", "comfortable"],
    isTemplate: true
  },

  {
    name: "Modern Kitchen",
    type: "kitchen",
    layout: {
      width: 3.5,
      length: 4.0,
      height: 2.4,
      walls: [
        {
          id: "wall1",
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 4, y: 0 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "white-tile", exterior: "white-paint" }
        },
        {
          id: "wall2",
          startPoint: { x: 4, y: 0 },
          endPoint: { x: 4, y: 3.5 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "white-tile", exterior: "white-paint" }
        },
        {
          id: "wall3",
          startPoint: { x: 4, y: 3.5 },
          endPoint: { x: 0, y: 3.5 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "white-tile", exterior: "white-paint" }
        },
        {
          id: "wall4",
          startPoint: { x: 0, y: 3.5 },
          endPoint: { x: 0, y: 0 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "white-tile", exterior: "white-paint" }
        }
      ],
      openings: [
        {
          wallId: "wall1",
          type: "window",
          position: 0.5,
          width: 1.0,
          height: 0.8
        },
        {
          wallId: "wall4",
          type: "door",
          position: 0.1,
          width: 0.9,
          height: 2.1
        }
      ],
      floor: {
        material: "ceramic-tile",
        elevation: 0
      },
      ceiling: {
        material: "white-paint",
        height: 2.4,
        type: "flat"
      }
    },
    style: "modern",
    lighting: {
      natural: [{
        type: "window",
        intensity: 1.0,
        direction: "north"
      }],
      artificial: [{
        type: "task",
        intensity: 1.2,
        color: "#ffffff"
      }]
    },
    tags: ["functional", "bright", "modern", "cooking"],
    isTemplate: true
  },

  {
    name: "Luxury Bathroom",
    type: "bathroom",
    layout: {
      width: 2.5,
      length: 3.0,
      height: 2.4,
      walls: [
        {
          id: "wall1",
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 3, y: 0 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "marble-tile", exterior: "white-paint" }
        },
        {
          id: "wall2",
          startPoint: { x: 3, y: 0 },
          endPoint: { x: 3, y: 2.5 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "marble-tile", exterior: "white-paint" }
        },
        {
          id: "wall3",
          startPoint: { x: 3, y: 2.5 },
          endPoint: { x: 0, y: 2.5 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "marble-tile", exterior: "white-paint" }
        },
        {
          id: "wall4",
          startPoint: { x: 0, y: 2.5 },
          endPoint: { x: 0, y: 0 },
          thickness: 0.15,
          height: 2.4,
          material: { interior: "marble-tile", exterior: "white-paint" }
        }
      ],
      openings: [
        {
          wallId: "wall2",
          type: "window",
          position: 0.5,
          width: 0.6,
          height: 0.6
        },
        {
          wallId: "wall4",
          type: "door",
          position: 0.1,
          width: 0.8,
          height: 2.0
        }
      ],
      floor: {
        material: "marble-tile",
        elevation: 0
      },
      ceiling: {
        material: "white-paint",
        height: 2.4,
        type: "flat"
      }
    },
    style: "luxury",
    lighting: {
      natural: [{
        type: "window",
        intensity: 0.7,
        direction: "west"
      }],
      artificial: [{
        type: "ambient",
        intensity: 0.8,
        color: "#fff8dc"
      }]
    },
    tags: ["luxury", "spa", "relaxing", "marble"],
    isTemplate: true
  }
];

// Sample house templates
const sampleHouseTemplates = [
  {
    name: "Modern Family Home",
    description: "A contemporary 3-bedroom, 2-bathroom family home with open-plan living and modern amenities",
    specifications: {
      totalArea: 150,
      bedrooms: 3,
      bathrooms: 2,
      floors: 1,
      garageSpaces: 2
    },
    exterior: {
      style: "modern"
    },
    category: "house",
    priceRange: "mid-range",
    tags: ["family", "modern", "spacious", "open-plan"],
    thumbnail: "https://example.com/thumbnails/modern-family-home.jpg",
    images: [
      "https://example.com/images/modern-family-home-1.jpg",
      "https://example.com/images/modern-family-home-2.jpg"
    ],
    isPublic: true
  },
  
  {
    name: "Cozy Studio Apartment",
    description: "Efficient studio apartment perfect for urban living with smart storage solutions",
    specifications: {
      totalArea: 45,
      bedrooms: 0,
      bathrooms: 1,
      floors: 1,
      garageSpaces: 0
    },
    exterior: {
      style: "contemporary"
    },
    category: "studio",
    priceRange: "budget",
    tags: ["studio", "compact", "urban", "efficient"],
    thumbnail: "https://example.com/thumbnails/cozy-studio.jpg",
    images: [
      "https://example.com/images/cozy-studio-1.jpg"
    ],
    isPublic: true
  },

  {
    name: "Luxury Villa",
    description: "Spacious luxury villa with 4 bedrooms, 3 bathrooms, and premium finishes throughout",
    specifications: {
      totalArea: 300,
      bedrooms: 4,
      bathrooms: 3,
      floors: 2,
      garageSpaces: 3
    },
    exterior: {
      style: "contemporary"
    },
    category: "villa",
    priceRange: "luxury",
    tags: ["luxury", "spacious", "premium", "villa"],
    thumbnail: "https://example.com/thumbnails/luxury-villa.jpg",
    images: [
      "https://example.com/images/luxury-villa-1.jpg",
      "https://example.com/images/luxury-villa-2.jpg",
      "https://example.com/images/luxury-villa-3.jpg"
    ],
    isPublic: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/renderhaus');
    console.log('Connected to MongoDB');

    // Clear existing room and house template data
    await Room.deleteMany({});
    await HouseTemplate.deleteMany({});
    console.log('Cleared existing room and house template data');

    // Insert room templates
    console.log('Seeding room templates...');
    const rooms = await Room.insertMany(sampleRooms);
    console.log(`Created ${rooms.length} room templates`);

    // Add rooms to house templates
    const updatedHouseTemplates = sampleHouseTemplates.map((template, index) => {
      // Assign rooms to each house template
      const roomsForThisTemplate = rooms.slice(0, Math.min(rooms.length, template.specifications.bedrooms + 2)); // bedrooms + kitchen + living room
      
      template.floors = [{
        level: 0,
        elevation: 0,
        rooms: roomsForThisTemplate.map((room, roomIndex) => ({
          roomId: room._id,
          position: {
            x: (roomIndex % 3) * 7, // arrange in grid
            y: Math.floor(roomIndex / 3) * 6,
            z: 0
          },
          customizations: {
            canResize: true,
            canMove: false,
            canReplace: true
          }
        })),
        connections: [{
          type: "hallway",
          path: [
            { x: 3, y: 0 },
            { x: 3, y: 6 },
            { x: 10, y: 6 }
          ],
          width: 1.2
        }]
      }];
      
      return template;
    });

    // Insert house templates
    console.log('Seeding house templates...');
    const houseTemplates = await HouseTemplate.insertMany(updatedHouseTemplates);
    console.log(`Created ${houseTemplates.length} house templates`);

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
    console.log(`✅ ${rooms.length} room templates created`);
    console.log(`✅ ${houseTemplates.length} house templates created`);
    console.log('\nNew API endpoints available:');
    console.log('- GET /api/design/rooms - Get all room templates');
    console.log('- GET /api/design/rooms/types - Get room types');
    console.log('- GET /api/design/templates - Get house templates');
    console.log('- GET /api/design/templates/:id - Get specific house template');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
