const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Model3D = require('./models/Model3D');
const Component = require('./models/Component');

// Quick test to add some minimal data
const quickTestData = async () => {
  try {
    console.log('🚀 Adding quick test data...');

    // Create a test user if it doesn't exist
    const testUser = await User.findOneAndUpdate(
      { email: 'testuser@example.com' },
      {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword123',
        isActive: true,
        role: 'user'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Test user ready');

    // Add some Model3D items
    const model3DData = [
      { name: 'Living Room A', category: 'room_template', description: 'Modern living room' },
      { name: 'Bedroom B', category: 'room_template', description: 'Cozy bedroom' }
    ];

    for (const data of model3DData) {
      await Model3D.findOneAndUpdate(
        { name: data.name },
        {
          ...data,
          uploadedBy: testUser._id,
          fileUrl: `https://example.com/${data.name.toLowerCase().replace(/\s+/g, '-')}.glb`,
          thumbnailUrl: `https://example.com/thumbnails/${data.name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Model3D items ready');

    // Add some Components
    const componentData = [
      { name: 'Sofa', category: 'furniture', description: 'Modern sofa' },
      { name: 'Table', category: 'furniture', description: 'Coffee table' },
      { name: 'Lamp', category: 'lighting', description: 'Floor lamp' }
    ];

    const savedComponents = [];
    for (const data of componentData) {
      const component = await Component.findOneAndUpdate(
        { name: data.name },
        {
          ...data,
          uploadedBy: testUser._id,
          fileUrl: `https://example.com/${data.name.toLowerCase()}.glb`,
          thumbnailUrl: `https://example.com/thumbnails/${data.name.toLowerCase()}.jpg`,
          isActive: true
        },
        { upsert: true, new: true }
      );
      savedComponents.push(component);
    }
    console.log('✅ Components ready');

    // Add some Projects with objects
    const projectData = [
      {
        name: 'Test Project 1',
        objects: [
          { modelId: savedComponents[0]._id, modelType: 'Component' },
          { modelId: savedComponents[1]._id, modelType: 'Component' }
        ]
      },
      {
        name: 'Test Project 2',
        objects: [
          { modelId: savedComponents[0]._id, modelType: 'Component' },
          { modelId: savedComponents[2]._id, modelType: 'Component' }
        ]
      },
      {
        name: 'Test Project 3',
        objects: [
          { modelId: savedComponents[1]._id, modelType: 'Component' }
        ]
      }
    ];

    for (const data of projectData) {
      await Project.findOneAndUpdate(
        { name: data.name, userId: testUser._id },
        {
          ...data,
          userId: testUser._id,
          canvasData: { objects: [], background: '#ffffff' }
        },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Projects ready');

    console.log('🎉 Quick test data ready!');

  } catch (error) {
    console.error('❌ Error adding quick test data:', error);
  }
};

// Connect and run
mongoose.connect('mongodb+srv://dairymilkyway:090504@cluster0.4f6pn.mongodb.net/renderhaus?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  return quickTestData();
})
.then(() => {
  mongoose.disconnect();
  console.log('Disconnected from MongoDB');
})
.catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
});
