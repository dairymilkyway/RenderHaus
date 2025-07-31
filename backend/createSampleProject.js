const mongoose = require('mongoose');
const Project = require('./models/Project');

// Connect to MongoDB
mongoose.connect('mongodb+srv://dairymilkyway:090504@cluster0.4f6pn.mongodb.net/renderhaus?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const addSampleProjectWithPreview = async () => {
  try {
    console.log('🎨 Adding sample project with preview...');

    // Create a simple SVG preview
    const svgPreview = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad)"/>
        <rect x="50" y="120" width="100" height="60" fill="white" fill-opacity="0.2" rx="4"/>
        <rect x="200" y="100" width="80" height="80" fill="white" fill-opacity="0.2" rx="4"/>
        <rect x="320" y="80" width="50" height="120" fill="white" fill-opacity="0.2" rx="4"/>
        <text x="200" y="40" fill="white" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle">Sample Project</text>
        <text x="200" y="270" fill="white" font-family="Arial" font-size="14" text-anchor="middle">3 items</text>
      </svg>
    `).toString('base64')}`;

    // Find a user (create a test user if needed)
    const testUser = await mongoose.connection.db.collection('users').findOne({ email: 'testuser@example.com' }) 
      || await mongoose.connection.db.collection('users').insertOne({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'testpassword123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

    const userId = testUser._id || testUser.insertedId;

    const sampleProject = new Project({
      name: 'Sample Project with Preview',
      description: 'This is a test project with a preview image',
      preview: svgPreview,
      owner: userId,
      type: 'interior',
      dimensions: { width: 20, height: 10, depth: 20 },
      objects: [
        {
          modelId: new mongoose.Types.ObjectId(),
          modelType: 'Component',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 }
        }
      ],
      status: 'active'
    });

    await sampleProject.save();
    console.log('✅ Sample project created with preview!');
    console.log('Preview data length:', svgPreview.length);
    
  } catch (error) {
    console.error('❌ Error creating sample project:', error);
  } finally {
    mongoose.disconnect();
  }
};

addSampleProjectWithPreview();
