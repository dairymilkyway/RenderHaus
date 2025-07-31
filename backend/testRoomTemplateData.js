const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Model3D = require('./models/Model3D');
const Component = require('./models/Component');

// Connect to MongoDB
mongoose.connect('mongodb+srv://dairymilkyway:090504@cluster0.4f6pn.mongodb.net/renderhaus?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedRoomTemplateTestData = async () => {
  try {
    console.log('🌱 Starting room template test data seeding...');

    // Get or create a test user
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      testUser = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword123',
        isActive: true
      });
      await testUser.save();
      console.log('✅ Created test user');
    }

    // Create some sample Model3D items (room templates)
    const roomTemplates = [
      { name: 'Living Room Template A', category: 'room_template', description: 'Modern living room' },
      { name: 'Bedroom Template B', category: 'room_template', description: 'Cozy bedroom setup' },
      { name: 'Kitchen Template C', category: 'room_template', description: 'Modern kitchen layout' },
      { name: 'Office Template D', category: 'room_template', description: 'Professional office space' },
      { name: 'Bathroom Template E', category: 'room_template', description: 'Luxury bathroom' }
    ];

    const savedRoomTemplates = [];
    for (const template of roomTemplates) {
      let existingTemplate = await Model3D.findOne({ name: template.name });
      if (!existingTemplate) {
        const newTemplate = new Model3D({
          ...template,
          uploadedBy: testUser._id,
          fileUrl: `https://example.com/${template.name.toLowerCase().replace(/\s+/g, '-')}.glb`,
          thumbnailUrl: `https://example.com/thumbnails/${template.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          isActive: true
        });
        await newTemplate.save();
        savedRoomTemplates.push(newTemplate);
        console.log(`✅ Created room template: ${template.name}`);
      } else {
        savedRoomTemplates.push(existingTemplate);
        console.log(`♻️ Using existing room template: ${template.name}`);
      }
    }

    // Create some sample Components
    const components = [
      { name: 'Modern Sofa', category: 'furniture', description: 'Comfortable modern sofa' },
      { name: 'Coffee Table', category: 'furniture', description: 'Glass coffee table' },
      { name: 'Floor Lamp', category: 'lighting', description: 'Minimalist floor lamp' },
      { name: 'Dining Chair', category: 'furniture', description: 'Wooden dining chair' },
      { name: 'Bookshelf', category: 'furniture', description: 'Tall wooden bookshelf' },
      { name: 'Ceiling Fan', category: 'lighting', description: 'Modern ceiling fan' }
    ];

    const savedComponents = [];
    for (const component of components) {
      let existingComponent = await Component.findOne({ name: component.name });
      if (!existingComponent) {
        const newComponent = new Component({
          ...component,
          uploadedBy: testUser._id,
          fileUrl: `https://example.com/${component.name.toLowerCase().replace(/\s+/g, '-')}.glb`,
          thumbnailUrl: `https://example.com/thumbnails/${component.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          isActive: true
        });
        await newComponent.save();
        savedComponents.push(newComponent);
        console.log(`✅ Created component: ${component.name}`);
      } else {
        savedComponents.push(existingComponent);
        console.log(`♻️ Using existing component: ${component.name}`);
      }
    }

    // Helper function to create SVG preview
    const createSVGPreview = (projectName, gradient1, gradient2, itemCount) => {
      const svg = `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${gradient1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${gradient2};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <rect x="50" y="120" width="100" height="60" fill="white" fill-opacity="0.2" rx="4"/>
        <rect x="200" y="100" width="80" height="80" fill="white" fill-opacity="0.2" rx="4"/>
        <rect x="320" y="80" width="50" height="120" fill="white" fill-opacity="0.2" rx="4"/>
        <circle cx="350" cy="50" r="20" fill="white" fill-opacity="0.3"/>
        <text x="200" y="40" fill="white" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle">${projectName}</text>
        <text x="200" y="270" fill="white" font-family="Arial" font-size="14" text-anchor="middle">${itemCount} items</text>
      </svg>`;
      return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    };

    // Create sample projects with various combinations of room templates and components
    const projects = [
      {
        name: 'Modern Living Space',
        description: 'A contemporary living room design',
        preview: createSVGPreview('Modern Living Space', '#667eea', '#764ba2', 4),
        objects: [
          { modelId: savedRoomTemplates[0]._id, modelType: 'Model3D' }, // Living Room Template A
          { modelId: savedComponents[0]._id, modelType: 'Component' }, // Modern Sofa
          { modelId: savedComponents[1]._id, modelType: 'Component' }, // Coffee Table
          { modelId: savedComponents[2]._id, modelType: 'Component' }  // Floor Lamp
        ]
      },
      {
        name: 'Cozy Bedroom Design',
        description: 'A warm and comfortable bedroom setup',
        preview: createSVGPreview('Cozy Bedroom', '#f093fb', '#f5576c', 3),
        objects: [
          { modelId: savedRoomTemplates[1]._id, modelType: 'Model3D' }, // Bedroom Template B
          { modelId: savedComponents[4]._id, modelType: 'Component' }, // Bookshelf
          { modelId: savedComponents[2]._id, modelType: 'Component' }  // Floor Lamp
        ]
      },
      {
        name: 'Kitchen & Dining Area',
        description: 'Modern kitchen with dining space',
        preview: createSVGPreview('Kitchen & Dining', '#4facfe', '#00f2fe', 4),
        objects: [
          { modelId: savedRoomTemplates[2]._id, modelType: 'Model3D' }, // Kitchen Template C
          { modelId: savedComponents[3]._id, modelType: 'Component' }, // Dining Chair
          { modelId: savedComponents[3]._id, modelType: 'Component' }, // Another Dining Chair
          { modelId: savedComponents[5]._id, modelType: 'Component' }  // Ceiling Fan
        ]
      },
      {
        name: 'Home Office Setup',
        description: 'Professional workspace design',
        preview: createSVGPreview('Home Office', '#43e97b', '#38d9a9', 3),
        objects: [
          { modelId: savedRoomTemplates[3]._id, modelType: 'Model3D' }, // Office Template D
          { modelId: savedComponents[4]._id, modelType: 'Component' }, // Bookshelf
          { modelId: savedComponents[2]._id, modelType: 'Component' }  // Floor Lamp
        ]
      },
      {
        name: 'Luxury Suite',
        description: 'High-end bedroom and bathroom combination',
        preview: createSVGPreview('Luxury Suite', '#fa709a', '#fee140', 5),
        objects: [
          { modelId: savedRoomTemplates[4]._id, modelType: 'Model3D' }, // Bathroom Template E
          { modelId: savedRoomTemplates[1]._id, modelType: 'Model3D' }, // Bedroom Template B
          { modelId: savedComponents[0]._id, modelType: 'Component' }, // Modern Sofa
          { modelId: savedComponents[1]._id, modelType: 'Component' }, // Coffee Table
          { modelId: savedComponents[2]._id, modelType: 'Component' }  // Floor Lamp
        ]
      },
      {
        name: 'Minimalist Space',
        description: 'Clean and simple design',
        preview: createSVGPreview('Minimalist Space', '#a8edea', '#fed6e3', 2),
        objects: [
          { modelId: savedRoomTemplates[0]._id, modelType: 'Model3D' }, // Living Room Template A (popular)
          { modelId: savedComponents[0]._id, modelType: 'Component' }   // Modern Sofa (popular)
        ]
      },
      {
        name: 'Family Home',
        description: 'Complete family living space',
        preview: createSVGPreview('Family Home', '#ffecd2', '#fcb69f', 5),
        objects: [
          { modelId: savedRoomTemplates[0]._id, modelType: 'Model3D' }, // Living Room Template A (popular again)
          { modelId: savedRoomTemplates[2]._id, modelType: 'Model3D' }, // Kitchen Template C
          { modelId: savedComponents[0]._id, modelType: 'Component' }, // Modern Sofa (popular again)
          { modelId: savedComponents[3]._id, modelType: 'Component' }, // Dining Chair
          { modelId: savedComponents[3]._id, modelType: 'Component' }  // Another Dining Chair
        ]
      }
    ];

    // Delete existing test projects
    await Project.deleteMany({ userId: testUser._id });
    console.log('🗑️ Cleared existing test projects');

    // Create new projects
    for (const projectData of projects) {
      const project = new Project({
        ...projectData,
        userId: testUser._id,
        canvasData: {
          objects: [],
          background: '#ffffff'
        }
      });
      await project.save();
      console.log(`✅ Created project: ${projectData.name} with ${projectData.objects.length} objects`);
    }

    console.log('\n🎉 Room template test data seeding completed!');
    console.log(`📊 Created ${savedRoomTemplates.length} room templates`);
    console.log(`📊 Created ${savedComponents.length} components`);
    console.log(`📊 Created ${projects.length} projects`);
    
    // Show usage statistics
    console.log('\n📈 Expected Room Template Usage:');
    console.log('- Living Room Template A: 3 times (most popular)');
    console.log('- Kitchen Template C: 2 times');
    console.log('- Bedroom Template B: 2 times');
    console.log('- Office Template D: 1 time');
    console.log('- Bathroom Template E: 1 time');
    
    console.log('\n📈 Expected Component Usage:');
    console.log('- Modern Sofa: 3 times (most popular)');
    console.log('- Dining Chair: 4 times (most popular)');
    console.log('- Floor Lamp: 4 times (most popular)');
    console.log('- Coffee Table: 2 times');
    console.log('- Bookshelf: 2 times');
    console.log('- Ceiling Fan: 1 time');

  } catch (error) {
    console.error('❌ Error seeding room template test data:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the seeding
seedRoomTemplateTestData();
