const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Model3D = require('../models/Model3D');
const Component = require('../models/Component');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Helper function to determine model type and validate existence
async function getModelTypeAndValidate(modelId) {
  try {
    // First try Model3D collection
    const model3D = await Model3D.findById(modelId);
    if (model3D) {
      return { type: 'Model3D', exists: true, model: model3D };
    }
    
    // Then try Component collection
    const component = await Component.findById(modelId);
    if (component) {
      return { type: 'Component', exists: true, model: component };
    }
    
    // Model doesn't exist in either collection
    return { type: null, exists: false, model: null };
  } catch (error) {
    console.error('Error validating model:', error);
    return { type: null, exists: false, model: null };
  }
}

// Get all projects for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId })
      .populate('objects.modelId', 'name category fileUrl modelFile')
      .populate('baseTemplate', 'name')
      .sort({ lastModified: -1 });

    res.json({
      status: 'success',
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch projects'
    });
  }
});

// Get a specific project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user.userId 
    }).populate('objects.modelId', 'name category fileUrl modelFile');

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Debug: Log the populated project objects
    console.log('=== PROJECT LOADING DEBUG ===');
    console.log('Project ID:', req.params.id);
    console.log('Project objects count:', project.objects.length);
    console.log('Loading project with populated objects:', project.objects.map((obj, index) => ({
      index,
      instanceId: obj.instanceId,
      modelId: obj.modelId,
      modelType: obj.modelType,
      isPopulated: obj.modelId !== null && typeof obj.modelId === 'object',
      modelName: obj.modelId ? obj.modelId.name : 'null',
      hasId: obj.modelId && obj.modelId._id ? true : false,
      actualObject: obj.modelId
    })));
    console.log('=== END PROJECT DEBUG ===');

    res.json({
      status: 'success',
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch project'
    });
  }
});

// Create a new project (save canvas)
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      placedModels,
      camera,
      environment,
      dimensions,
      type = 'interior'
    } = req.body;

    console.log('Creating project with user:', req.user);
    console.log('User ID from token:', req.user.userId);
    console.log('Placed models received:', JSON.stringify(placedModels, null, 2));

    // Convert placed models to the Project schema format
    const objects = [];
    
    for (const model of placedModels || []) {
      console.log('Processing model:', model);
      
      // For models without _id, skip them
      let modelId = model._id;
      if (!modelId) {
        console.warn('Model missing _id, skipping:', model.id);
        continue;
      }
      
      // Determine which collection this model belongs to
      const modelInfo = await getModelTypeAndValidate(modelId);
      if (!modelInfo.exists) {
        console.warn('Model not found in any collection:', modelId);
        continue;
      }
      
      console.log('Model found in:', modelInfo.type, 'with name:', modelInfo.model.name);
      // Handle position - could be array [x, y, z] or object {x, y, z}
      let position = { x: 0, y: 0, z: 0 };
      if (model.position) {
        if (Array.isArray(model.position)) {
          position = {
            x: model.position[0] || 0,
            y: model.position[1] || 0,
            z: model.position[2] || 0
          };
        } else if (typeof model.position === 'object') {
          position = {
            x: model.position.x || 0,
            y: model.position.y || 0,
            z: model.position.z || 0
          };
        }
      }

      // Handle rotation - could be array [x, y, z] or object {x, y, z}
      let rotation = { x: 0, y: 0, z: 0 };
      if (model.rotation) {
        if (Array.isArray(model.rotation)) {
          rotation = {
            x: model.rotation[0] || 0,
            y: model.rotation[1] || 0,
            z: model.rotation[2] || 0
          };
        } else if (typeof model.rotation === 'object') {
          rotation = {
            x: model.rotation.x || 0,
            y: model.rotation.y || 0,
            z: model.rotation.z || 0
          };
        }
      }

      // Handle scale - could be array [x, y, z] or object {x, y, z} or single value
      let scale = { x: 1, y: 1, z: 1 };
      if (model.scale) {
        if (Array.isArray(model.scale)) {
          scale = {
            x: model.scale[0] || 1,
            y: model.scale[1] || 1,
            z: model.scale[2] || 1
          };
        } else if (typeof model.scale === 'object') {
          scale = {
            x: model.scale.x || 1,
            y: model.scale.y || 1,
            z: model.scale.z || 1
          };
        } else if (typeof model.scale === 'number') {
          scale = { x: model.scale, y: model.scale, z: model.scale };
        }
      }

      // Add the processed object to the array
      objects.push({
        modelId: modelId,
        modelType: modelInfo.type,
        position,
        rotation,
        scale,
        customMaterial: model.customMaterial || {},
        instanceId: model.id || uuidv4()
      });
    }

    console.log('Processed objects:', JSON.stringify(objects, null, 2));

    const project = new Project({
      name: name || `Project ${new Date().toLocaleString()}`,
      description: description || '',
      owner: req.user.userId,
      type,
      dimensions: dimensions || { width: 20, height: 10, depth: 20 },
      objects,
      camera: camera || {
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
      },
      environment: environment || {
        lighting: 'natural',
        backgroundColor: '#f0f0f0',
        ambientColor: '#404040'
      },
      status: 'draft'
    });

    await project.save();
    
    // Populate the saved project before returning
    const populatedProject = await Project.findById(project._id)
      .populate('objects.modelId', 'name category fileUrl modelFile');

    res.status(201).json({
      status: 'success',
      message: 'Project saved successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save project'
    });
  }
});

// Update an existing project
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      placedModels,
      camera,
      environment,
      dimensions,
      status
    } = req.body;

    const project = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    // Convert placed models to the Project schema format
    if (placedModels) {
      const objects = [];
      
      for (const model of placedModels || []) {
        // Skip models without _id (they don't exist in database)
        if (!model._id) {
          console.warn('Skipping model without _id:', model.name || 'Unknown model');
          continue;
        }
        
        // Determine which collection this model belongs to
        const modelInfo = await getModelTypeAndValidate(model._id);
        if (!modelInfo.exists) {
          console.warn('Model not found in any collection:', model._id);
          continue;
        }

        // Handle position - could be array [x, y, z] or object {x, y, z}
        let position = { x: 0, y: 0, z: 0 };
        if (model.position) {
          if (Array.isArray(model.position)) {
            position = {
              x: model.position[0] || 0,
              y: model.position[1] || 0,
              z: model.position[2] || 0
            };
          } else if (typeof model.position === 'object') {
            position = {
              x: model.position.x || 0,
              y: model.position.y || 0,
              z: model.position.z || 0
            };
          }
        }

        // Handle rotation - could be array [x, y, z] or object {x, y, z}
        let rotation = { x: 0, y: 0, z: 0 };
        if (model.rotation) {
          if (Array.isArray(model.rotation)) {
            rotation = {
              x: model.rotation[0] || 0,
              y: model.rotation[1] || 0,
              z: model.rotation[2] || 0
            };
          } else if (typeof model.rotation === 'object') {
            rotation = {
              x: model.rotation.x || 0,
              y: model.rotation.y || 0,
              z: model.rotation.z || 0
            };
          }
        }

        // Handle scale - could be array [x, y, z] or object {x, y, z} or single value
        let scale = { x: 1, y: 1, z: 1 };
        if (model.scale) {
          if (Array.isArray(model.scale)) {
            scale = {
              x: model.scale[0] || 1,
              y: model.scale[1] || 1,
              z: model.scale[2] || 1
            };
          } else if (typeof model.scale === 'object') {
            scale = {
              x: model.scale.x || 1,
              y: model.scale.y || 1,
              z: model.scale.z || 1
            };
          } else if (typeof model.scale === 'number') {
            scale = { x: model.scale, y: model.scale, z: model.scale };
          }
        }

        // Add the processed object to the array
        objects.push({
          modelId: model._id,
          modelType: modelInfo.type,
          position,
          rotation,
          scale,
          customMaterial: model.customMaterial || {},
          instanceId: model.id || uuidv4()
        });
      }
      
      project.objects = objects;
    }

    // Update other fields if provided
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (camera) project.camera = camera;
    if (environment) project.environment = environment;
    if (dimensions) project.dimensions = dimensions;
    if (status) project.status = status;

    // Increment version
    project.version += 1;

    await project.save();

    // Populate the updated project before returning
    const populatedProject = await Project.findById(project._id)
      .populate('objects.modelId', 'name category fileUrl modelFile');

    res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update project'
    });
  }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user.userId 
    });

    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete project'
    });
  }
});

// Duplicate a project
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalProject = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user.userId 
    });

    if (!originalProject) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }

    const duplicatedProject = new Project({
      ...originalProject.toObject(),
      _id: undefined,
      name: `${originalProject.name} (Copy)`,
      version: 1,
      createdAt: new Date(),
      lastModified: new Date()
    });

    await duplicatedProject.save();

    // Populate the duplicated project before returning
    const populatedProject = await Project.findById(duplicatedProject._id)
      .populate({
        path: 'objects.modelId',
        select: 'name category fileUrl modelFile'
      });

    res.status(201).json({
      status: 'success',
      message: 'Project duplicated successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error('Error duplicating project:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to duplicate project'
    });
  }
});

module.exports = router;
