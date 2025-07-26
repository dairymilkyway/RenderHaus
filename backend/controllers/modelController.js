const Model3D = require('../models/Model3D');
const Room = require('../models/Room');
const Component = require('../models/Component');
const mongoose = require('mongoose');
const { uploadModel, deleteModel: deleteUploadcareFile } = require('../config/uploadcare');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for Uploadcare free tier
  },
  fileFilter: (req, file, cb) => {
    // Accept common 3D model formats
    const allowedTypes = ['.gltf', '.glb', '.obj', '.fbx', '.dae', '.3ds'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only 3D model files are allowed.'), false);
    }
  }
});

// Get all 3D models with filtering and pagination
const getModels = async (req, res) => {
  try {
    const {
      category,
      style,
      tags,
      search,
      page = 1,
      limit = 20
    } = req.query;

    let response = { components: [], roomTemplates: [] };

    // If category is specified, get only that type
    if (category === 'components') {
      // Get components from Component collection
      const filter = { isActive: true };
      
      if (style) filter.style = style;
      if (tags) filter.tags = { $in: tags.split(',') };
      
      if (search) {
        filter.$text = { $search: search };
      }

      const components = await Component.find(filter)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Component.countDocuments(filter);

      response.components = components;
      response.pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      };
    } else if (category === 'room template') {
      // Get room templates from Model3D collection
      const filter = { isActive: true };
      
      if (style) filter.style = style;
      if (tags) filter.tags = { $in: tags.split(',') };
      
      if (search) {
        filter.$text = { $search: search };
      }

      const roomTemplates = await Model3D.find(filter)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Model3D.countDocuments(filter);

      response.roomTemplates = roomTemplates;
      response.pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      };
    } else {
      // Get both types if no category specified
      const componentsFilter = { isActive: true };
      const roomTemplatesFilter = { isActive: true };
      
      if (style) {
        componentsFilter.style = style;
        roomTemplatesFilter.style = style;
      }
      if (tags) {
        componentsFilter.tags = { $in: tags.split(',') };
        roomTemplatesFilter.tags = { $in: tags.split(',') };
      }
      
      if (search) {
        componentsFilter.$text = { $search: search };
        roomTemplatesFilter.$text = { $search: search };
      }

      const [components, roomTemplates] = await Promise.all([
        Component.find(componentsFilter)
          .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
          .limit(Math.ceil(limit / 2))
          .exec(),
        Model3D.find(roomTemplatesFilter)
          .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
          .limit(Math.ceil(limit / 2))
          .exec()
      ]);

      response.components = components;
      response.roomTemplates = roomTemplates;
    }

    res.json({
      status: 'success',
      data: response
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single model by ID
const getModelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid model ID'
      });
    }

    const model = await Model3D.findById(id);
    
    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'Model not found'
      });
    }

    // Increment download count
    await Model3D.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    res.json({
      status: 'success',
      data: model
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get model categories
const getCategories = async (req, res) => {
  try {
    const categories = await Model3D.distinct('category', { isActive: true });
    res.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get subcategories for a specific category
const getSubcategories = async (req, res) => {
  try {
    const { category } = req.params;
    const subcategories = await Model3D.distinct('subcategory', { 
      category, 
      isActive: true 
    });
    
    res.json({
      status: 'success',
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new model (Admin only)
const createModel = async (req, res) => {
  try {
    const modelData = req.body;
    const model = new Model3D(modelData);
    await model.save();

    res.status(201).json({
      status: 'success',
      data: model
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update model (Admin only)
const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    updates.updatedAt = new Date();

    console.log('=== Update Model Request ===');
    console.log('Model ID:', id);
    console.log('Updates:', updates);

    // First try to find in Model3D collection (room templates)
    let model = await Model3D.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    let collectionType = 'Model3D';

    // If not found in Model3D, try Component collection
    if (!model) {
      model = await Component.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      collectionType = 'Component';
    }

    if (!model) {
      console.log('Model not found in either collection');
      return res.status(404).json({
        status: 'error',
        message: 'Model not found'
      });
    }

    console.log('Model updated successfully in', collectionType, 'collection');
    console.log('Updated model:', model);

    res.json({
      status: 'success',
      data: model
    });
  } catch (error) {
    console.error('=== Update Model Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete model (Admin only)
const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find and update in Model3D first
    let model = await Model3D.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    // If not found in Model3D, try Component collection
    if (!model) {
      model = await Component.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
    }

    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'Model not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Model deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Upload a new 3D model with file (Admin only)
const uploadModelFile = async (req, res) => {
  try {
    console.log('=== Upload Model File Request ===');
    console.log('Request file:', req.file ? 'File present' : 'No file');
    console.log('Request body:', req.body);
    
    if (!req.file) {
      console.log('Error: No file uploaded');
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    const {
      name,
      description,
      category,
      style,
      tags,
      dimensions,
      materials,
      compatibility,
      roomType, // For room templates
      subcategory // For components
    } = req.body;

    console.log('Starting Uploadcare upload...');
    
    // Upload file to Uploadcare
    const uploadResult = await uploadModel(
      req.file.buffer,
      req.file.originalname,
      {
        metadata: {
          category: category || 'components',
          style: style || 'modern'
        }
      }
    );

    console.log('Uploadcare upload successful:', {
      cdnUrl: uploadResult.cdnUrl,
      fileId: uploadResult.fileId
    });

    console.log('Creating database record...');
    
    // Check category and save to appropriate collection
    if (category === 'room template') {
      // Save to Model3D collection (room templates now go to Model3D)
      const newModel = new Model3D({
        name: name || req.file.originalname.split('.')[0],
        description: description || '',
        category: 'furniture', // Default category for Model3D schema compatibility
        subcategory: 'furniture', // Keep subcategory for Model3D schema compatibility
        style: style || 'modern',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        // For legacy compatibility, set both modelFile.url and fileUrl
        modelFile: {
          url: uploadResult.cdnUrl,
          format: req.file.originalname.split('.').pop().toLowerCase(),
          size: req.file.size
        },
        fileUrl: uploadResult.cdnUrl,
        uploadcareId: uploadResult.fileId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileFormat: req.file.originalname.split('.').pop().toLowerCase(),
        dimensions: dimensions ? JSON.parse(dimensions) : { width: 1, height: 1, depth: 1 },
        materials: materials ? materials.split(',').map(material => material.trim()) : [],
        compatibility: compatibility ? compatibility.split(',').map(comp => comp.trim()) : ['web', 'mobile'],
        isActive: true,
        // Add room type for room templates
        roomType: roomType || 'living-room'
      });

      const savedModel = await newModel.save();
      
      console.log('Room template saved successfully with ID:', savedModel._id);

      res.status(201).json({
        status: 'success',
        message: 'Room template uploaded successfully',
        data: savedModel,
        type: 'room template'
      });
    } else {
      // Save to Component collection (components now go to Component)
      const newComponent = new Component({
        name: name || req.file.originalname.split('.')[0],
        description: description || '',
        category: subcategory || 'furniture', // Use the selected subcategory
        subcategory: subcategory || 'furniture', // Keep subcategory for Component schema compatibility
        style: style || 'modern',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        // For legacy compatibility, set both modelFile.url and fileUrl
        modelFile: {
          url: uploadResult.cdnUrl,
          format: req.file.originalname.split('.').pop().toLowerCase(),
          size: req.file.size
        },
        fileUrl: uploadResult.cdnUrl,
        uploadcareId: uploadResult.fileId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileFormat: req.file.originalname.split('.').pop().toLowerCase(),
        dimensions: dimensions ? JSON.parse(dimensions) : { width: 1, height: 1, depth: 1 },
        materials: materials ? materials.split(',').map(material => material.trim()) : [],
        compatibility: compatibility ? compatibility.split(',').map(comp => comp.trim()) : ['web', 'mobile'],
        isActive: true
      });

      const savedComponent = await newComponent.save();
      
      console.log('Component saved successfully with ID:', savedComponent._id);

      res.status(201).json({
        status: 'success',
        message: 'Component uploaded successfully',
        data: savedComponent,
        type: 'component'
      });
    }
  } catch (error) {
    console.error('=== Upload Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    let errorMessage = error.message;
    let statusCode = 500;
    
    // Handle specific Uploadcare errors
    if (error.message.includes('413') || error.message.includes('File too large') || error.message.includes('Request Entity Too Large') || error.message.includes('File size too large')) {
      errorMessage = 'File is too large for upload. Uploadcare free tier supports files up to 100MB. Please try with a smaller file or consider upgrading your Uploadcare plan.';
      statusCode = 413;
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      errorMessage = 'Upload timeout. The file may be too large or the connection is slow. Please try with a smaller file.';
      statusCode = 408;
    } else if (error.message.includes('Uploadcare')) {
      errorMessage = `Cloud storage error: ${error.message}`;
    }
    
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage
    });
  }
};

// Update existing model with new file (Admin only)
const updateModelFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find in Model3D first, then Component
    let model = await Model3D.findById(id);
    let isComponent = false;
    
    if (!model) {
      model = await Component.findById(id);
      isComponent = true;
    }

    if (!model) {
      return res.status(404).json({
        status: 'error',
        message: 'Model not found'
      });
    }

    let updateData = { ...req.body };

    // If new file is uploaded
    if (req.file) {
      // Delete old file from Uploadcare
      if (model.uploadcareId) {
        await deleteUploadcareFile(model.uploadcareId);
      }

      // Upload new file
      const uploadResult = await uploadModel(
        req.file.buffer,
        req.file.originalname,
        {
          metadata: {
            category: req.body.category,
            subcategory: req.body.subcategory,
            style: req.body.style
          }
        }
      );

      updateData.fileUrl = uploadResult.cdnUrl;
      updateData.uploadcareId = uploadResult.fileId;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.fileFormat = req.file.originalname.split('.').pop().toLowerCase();
    }

    // Parse JSON fields if they exist
    if (updateData.dimensions) {
      updateData.dimensions = JSON.parse(updateData.dimensions);
    }
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    if (updateData.materials) {
      updateData.materials = updateData.materials.split(',').map(material => material.trim());
    }
    if (updateData.compatibility) {
      updateData.compatibility = updateData.compatibility.split(',').map(comp => comp.trim());
    }

    // Update in the correct collection
    const updatedModel = isComponent 
      ? await Component.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      : await Model3D.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.json({
      status: 'success',
      message: 'Model updated successfully',
      data: updatedModel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getModels,
  getModelById,
  getCategories,
  getSubcategories,
  createModel,
  updateModel,
  deleteModel,
  uploadModelFile,
  updateModelFile,
  upload // Export multer middleware
};
