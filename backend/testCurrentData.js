const mongoose = require('mongoose');
const Project = require('./models/Project');
const Model3D = require('./models/Model3D');
const Component = require('./models/Component');

// Connect to MongoDB
mongoose.connect('mongodb+srv://cocomeme2003:gYMBph9Y7p0DYnK2@cluster0.ssdil.mongodb.net/renderhaus?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const testCurrentProjectData = async () => {
  try {
    console.log('🔍 Testing current project data...');

    // Count total documents
    const totalProjects = await Project.countDocuments();
    const totalModel3D = await Model3D.countDocuments();
    const totalComponents = await Component.countDocuments();

    console.log(`📊 Total Projects: ${totalProjects}`);
    console.log(`📊 Total Model3D: ${totalModel3D}`);
    console.log(`📊 Total Components: ${totalComponents}`);

    // Get a sample of projects to see the structure
    const sampleProjects = await Project.find().limit(3).populate('objects.modelId');
    console.log('📋 Sample Projects:');
    sampleProjects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} - Objects: ${project.objects?.length || 0}`);
      if (project.objects && project.objects.length > 0) {
        project.objects.forEach((obj, objIndex) => {
          console.log(`   - Object ${objIndex + 1}: ${obj.modelType} (ID: ${obj.modelId})`);
        });
      }
    });

    // Test the aggregation for Model3D usage
    console.log('\n🔍 Testing Model3D usage aggregation...');
    const roomTemplateUsage = await Project.aggregate([
      { $unwind: '$objects' },
      { $match: { 'objects.modelType': 'Model3D' } },
      {
        $lookup: {
          from: 'model3ds',
          localField: 'objects.modelId',
          foreignField: '_id',
          as: 'modelData'
        }
      },
      { $unwind: '$modelData' },
      {
        $group: {
          _id: '$modelData.name',
          count: { $sum: 1 },
          category: { $first: '$modelData.category' },
          modelId: { $first: '$modelData._id' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('📊 Room Template Usage Results:', roomTemplateUsage);

    // Test the aggregation for Component usage
    console.log('\n🔍 Testing Component usage aggregation...');
    const componentUsage = await Project.aggregate([
      { $unwind: '$objects' },
      { $match: { 'objects.modelType': 'Component' } },
      {
        $lookup: {
          from: 'components',
          localField: 'objects.modelId',
          foreignField: '_id',
          as: 'componentData'
        }
      },
      { $unwind: '$componentData' },
      {
        $group: {
          _id: '$componentData.name',
          count: { $sum: 1 },
          category: { $first: '$componentData.category' },
          modelId: { $first: '$componentData._id' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('📊 Component Usage Results:', componentUsage);

    // List all Model3D names for reference
    const allModel3D = await Model3D.find().select('name category');
    console.log('\n📋 Available Model3D items:');
    allModel3D.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} (${model.category})`);
    });

    // List all Component names for reference
    const allComponents = await Component.find().select('name category');
    console.log('\n📋 Available Component items:');
    allComponents.forEach((component, index) => {
      console.log(`${index + 1}. ${component.name} (${component.category})`);
    });

  } catch (error) {
    console.error('❌ Error testing current data:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the test
testCurrentProjectData();
