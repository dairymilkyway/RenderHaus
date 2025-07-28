const mongoose = require('mongoose');
const Model3D = require('./models/Model3D');
const Component = require('./models/Component');

async function checkModels() {
  try {
    await mongoose.connect('mongodb://localhost:27017/renderhaus');
    
    const model3DCount = await Model3D.countDocuments();
    const componentCount = await Component.countDocuments();
    
    console.log('=== MODEL DATABASE STATUS ===');
    console.log('Model3D collection:', model3DCount, 'documents');
    console.log('Component collection:', componentCount, 'documents');
    
    if (model3DCount > 0) {
      const sampleModel = await Model3D.findOne().select('name fileUrl thumbnail category');
      console.log('\nSample Model3D:');
      console.log('Name:', sampleModel.name);
      console.log('Category:', sampleModel.category);
      console.log('File URL:', sampleModel.fileUrl ? sampleModel.fileUrl.substring(0, 60) + '...' : 'No URL');
      console.log('Has thumbnail:', !!sampleModel.thumbnail);
    }
    
    if (componentCount > 0) {
      const sampleComponent = await Component.findOne().select('name fileUrl thumbnail category');
      console.log('\nSample Component:');
      console.log('Name:', sampleComponent.name);
      console.log('Category:', sampleComponent.category);
      console.log('File URL:', sampleComponent.fileUrl ? sampleComponent.fileUrl.substring(0, 60) + '...' : 'No URL');
      console.log('Has thumbnail:', !!sampleComponent.thumbnail);
    }
    
    console.log('\n=== THUMBNAIL STATUS ===');
    const model3DWithThumbnails = await Model3D.countDocuments({ 
      thumbnail: { $exists: true, $ne: null, $ne: '' } 
    });
    const componentWithThumbnails = await Component.countDocuments({ 
      thumbnail: { $exists: true, $ne: null, $ne: '' } 
    });
    
    console.log('Model3D with thumbnails:', model3DWithThumbnails, '/', model3DCount);
    console.log('Components with thumbnails:', componentWithThumbnails, '/', componentCount);
    
    await mongoose.disconnect();
    console.log('\n=== CONNECTION CLOSED ===');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkModels();
