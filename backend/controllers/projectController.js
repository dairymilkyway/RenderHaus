const Project = require('../models/Project');
const User = require('../models/User');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');

// Get all projects with pagination and filtering (Admin only)
exports.getAllProjects = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      type = '', 
      status = '',
      owner = '',
      sortBy = 'lastModified',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Handle status filtering
    if (status === 'archived') {
      filter.deletedAt = { $ne: null }; // Show only archived projects
    } else if (status) {
      filter.status = status;
      filter.deletedAt = null; // Exclude archived projects for non-archived status filters
    } else {
      // Default: only show non-archived projects
      filter.deletedAt = null;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }

    if (owner) {
      // Find users matching the owner search term
      const users = await User.find({
        $or: [
          { name: { $regex: owner, $options: 'i' } },
          { email: { $regex: owner, $options: 'i' } }
        ]
      }).select('_id');
      
      if (users.length > 0) {
        filter.owner = { $in: users.map(u => u._id) };
      } else {
        // No matching users found, return empty result
        filter.owner = null;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get projects with pagination and populate owner
    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('baseTemplate', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / parseInt(limit));

    logger.info(`Admin ${req.user.userId} retrieved projects list`);

    res.json({
      status: 'success',
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProjects,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting projects:', error);
    next(error);
  }
};

// Get project by ID (Admin only)
exports.getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'name email role')
      .populate('baseTemplate', 'name description')
      .populate('objects.modelId', 'name category fileUrl');

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    logger.info(`Admin ${req.user.userId} retrieved project ${id}`);

    res.json({
      status: 'success',
      data: { project }
    });
  } catch (error) {
    logger.error('Error getting project by ID:', error);
    next(error);
  }
};

// Update project (Admin only)
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type, status } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    const validTypes = ['interior', 'exterior', 'mixed'];
    const validStatuses = ['draft', 'in-progress', 'completed', 'shared'];

    if (type && !validTypes.includes(type)) {
      throw new ValidationError('Invalid project type');
    }

    if (status && !validStatuses.includes(status)) {
      throw new ValidationError('Invalid project status');
    }

    const project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Update project fields
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description;
    if (type) project.type = type;
    if (status) project.status = status;

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'name email');

    logger.info(`Admin ${req.user.userId} updated project ${id}`);

    res.json({
      status: 'success',
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    logger.error('Error updating project:', error);
    next(error);
  }
};

// Update project status (Admin only)
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'in-progress', 'completed', 'shared'];
    
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError('Invalid project status');
    }

    const project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    project.status = status;
    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('owner', 'name email');

    logger.info(`Admin ${req.user.userId} updated project ${id} status to ${status}`);

    res.json({
      status: 'success',
      message: `Project status updated to ${status}`,
      data: { project: updatedProject }
    });
  } catch (error) {
    logger.error('Error updating project status:', error);
    next(error);
  }
};

// Archive project (Admin only) - Soft delete
exports.archiveProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Add deletedAt timestamp to mark as archived
    project.deletedAt = new Date();
    project.status = 'archived';
    await project.save();

    logger.info(`Admin ${req.user.userId} archived project ${id}`);

    res.json({
      status: 'success',
      message: 'Project archived successfully',
      data: { project }
    });
  } catch (error) {
    logger.error('Error archiving project:', error);
    next(error);
  }
};

// Restore archived project (Admin only)
exports.restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (!project.deletedAt) {
      throw new ValidationError('Project is not archived');
    }

    // Remove deletedAt timestamp to restore
    project.deletedAt = undefined;
    project.status = 'draft'; // Reset to draft status
    await project.save();

    const restoredProject = await Project.findById(id)
      .populate('owner', 'name email');

    logger.info(`Admin ${req.user.userId} restored project ${id}`);

    res.json({
      status: 'success',
      message: 'Project restored successfully',
      data: { project: restoredProject }
    });
  } catch (error) {
    logger.error('Error restoring project:', error);
    next(error);
  }
};

// Delete project permanently (Admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Store project info for logging before deletion
    const projectInfo = {
      name: project.name,
      owner: project.owner
    };

    // Permanently delete the project
    await Project.findByIdAndDelete(id);

    logger.info(`Admin ${req.user.userId} permanently deleted project ${id} (${projectInfo.name})`);

    res.json({
      status: 'success',
      message: 'Project deleted permanently'
    });
  } catch (error) {
    logger.error('Error deleting project:', error);
    next(error);
  }
};

// Get project statistics (Admin only)
exports.getProjectStats = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: { $ne: 'archived' } });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const sharedProjects = await Project.countDocuments({ isPublic: true });
    const archivedProjects = await Project.countDocuments({ deletedAt: { $ne: null } });

    // Projects by type
    const interiorProjects = await Project.countDocuments({ type: 'interior' });
    const exteriorProjects = await Project.countDocuments({ type: 'exterior' });
    const mixedProjects = await Project.countDocuments({ type: 'mixed' });

    // Projects by status
    const draftProjects = await Project.countDocuments({ status: 'draft' });
    const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });

    // Recent activity
    const recentProjects = await Project.find()
      .populate('owner', 'name')
      .sort({ lastModified: -1 })
      .limit(5)
      .select('name lastModified owner status');

    logger.info(`Admin ${req.user.userId} retrieved project statistics`);

    res.json({
      status: 'success',
      data: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        shared: sharedProjects,
        archived: archivedProjects,
        byType: {
          interior: interiorProjects,
          exterior: exteriorProjects,
          mixed: mixedProjects
        },
        byStatus: {
          draft: draftProjects,
          inProgress: inProgressProjects,
          completed: completedProjects,
          shared: sharedProjects
        },
        recent: recentProjects
      }
    });
  } catch (error) {
    logger.error('Error getting project statistics:', error);
    next(error);
  }
};

// Get archived projects (Admin only)
exports.getArchivedProjects = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      type = '',
      sortBy = 'deletedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object for archived projects only
    const filter = { deletedAt: { $ne: null } };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      filter.type = type;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get archived projects with pagination
    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalProjects = await Project.countDocuments(filter);
    const totalPages = Math.ceil(totalProjects / parseInt(limit));

    logger.info(`Admin ${req.user.userId} retrieved archived projects list`);

    res.json({
      status: 'success',
      data: {
        projects,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProjects,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting archived projects:', error);
    next(error);
  }
};
