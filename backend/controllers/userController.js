const User = require('../models/User');
const logger = require('../utils/logger');
const { NotFoundError, ValidationError } = require('../utils/errors');

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '', 
      status = '',
      verification = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Handle status filtering
    if (status === 'archived') {
      filter.deletedAt = { $ne: null }; // Show only archived (soft-deleted) users
    } else if (status === 'inactive') {
      filter.isActive = false;
      filter.deletedAt = null; // Show only deactivated but not archived users
    } else if (status === 'active') {
      filter.isActive = true;
      filter.deletedAt = null; // Show only active non-archived users
    } else if (status === 'all') {
      // Show all users including archived ones - no status filter applied
    } else {
      // Default (empty string or undefined): only show non-archived users (active + inactive)
      filter.deletedAt = null;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }

    // Add verification filter
    if (verification === 'verified') {
      filter.isEmailVerified = true;
    } else if (verification === 'unverified') {
      filter.isEmailVerified = false;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Debug logging
    console.log('Status filter:', status);
    console.log('Verification filter:', verification);
    console.log('Final filter:', JSON.stringify(filter));

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Debug logging
    console.log('Found users count:', users.length);
    console.log('Users deletedAt values:', users.map(u => ({ id: u._id, deletedAt: u.deletedAt, isActive: u.isActive })));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    logger.info(`Admin ${req.user.userId} retrieved users list`);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    next(error);
  }
};

// Get archived users with pagination
exports.getArchivedUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      role = '',
      sortBy = 'deletedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object for archived users only
    const filter = { deletedAt: { $ne: null } };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get archived users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    logger.info(`Admin ${req.user.userId} retrieved archived users list`);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Error getting archived users:', error);
    next(error);
  }
};

// Create new user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', gender = 'other' } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      throw new ValidationError('Valid gender is required (male, female, or other)');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Check if user already exists (including soft-deleted users)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && !existingUser.deletedAt) {
      throw new ValidationError('User with this email already exists');
    }
    
    // If a soft-deleted user exists with this email, we can reuse the account
    if (existingUser && existingUser.deletedAt) {
      // Restore the soft-deleted user
      existingUser.name = name.trim();
      existingUser.password = password; // This will trigger the pre-save hash
      existingUser.gender = gender;
      existingUser.role = ['user', 'admin'].includes(role) ? role : 'user';
      existingUser.isActive = true;
      existingUser.deletedAt = null;
      existingUser.isEmailVerified = false; // Reset email verification
      existingUser.emailVerificationOTP = undefined;
      existingUser.emailVerificationExpires = undefined;
      
      await existingUser.save();
      
      // Remove password from response
      const userResponse = existingUser.toObject();
      delete userResponse.password;

      logger.info(`Restored soft-deleted user: ${email} by admin: ${req.user.userId}`);

      return res.status(201).json({
        status: 'success',
        message: 'User created successfully (account restored)',
        data: {
          user: userResponse
        }
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      gender,
      role: ['user', 'admin'].includes(role) ? role : 'user',
      isActive: true
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`New user created: ${email} by admin: ${req.user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    logger.info(`Admin ${req.user.userId} retrieved user ${id}`);

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, gender, isEmailVerified } = req.body;

    // Validate input
    if (!name || !email) {
      throw new ValidationError('Name and email are required');
    }

    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      throw new ValidationError('Invalid gender value');
    }

    // Check if user exists and is not soft-deleted
    const user = await User.findById(id);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User not found');
    }

    // Check if email is already taken by another non-deleted user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: id },
      deletedAt: null
    });
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    // Prepare update data
    const updateData = { name, email, role };
    
    // Add optional fields if provided
    if (gender !== undefined) {
      updateData.gender = gender;
    }
    
    if (isEmailVerified !== undefined) {
      updateData.isEmailVerified = isEmailVerified;
      // If verifying email, clear OTP data
      if (isEmailVerified) {
        updateData.emailVerificationOTP = undefined;
        updateData.emailVerificationExpires = undefined;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`Admin ${req.user.userId} updated user ${id}`, { updateData });

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

// Toggle user status (activate/deactivate)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent toggling status of archived users
    if (user.deletedAt) {
      throw new ValidationError('Cannot change status of archived users');
    }

    // Prevent admin from deactivating themselves
    if (id === req.user.userId) {
      throw new ValidationError('You cannot deactivate your own account');
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'activated' : 'deactivated';
    logger.info(`Admin ${req.user.userId} ${action} user ${id}`);

    res.json({
      status: 'success',
      message: `User ${action} successfully`,
      data: { 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    logger.error('Error toggling user status:', error);
    next(error);
  }
};

// Archive user (soft delete)
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already archived
    if (user.deletedAt) {
      throw new ValidationError('User is already archived');
    }

    // Prevent admin from archiving themselves
    if (id === req.user.userId) {
      throw new ValidationError('You cannot archive your own account');
    }

    // Archive user: set deletedAt timestamp and deactivate
    user.deletedAt = new Date();
    user.isActive = false;
    await user.save();

    logger.info(`Admin ${req.user.userId} archived user ${id}`);

    res.json({
      status: 'success',
      message: 'User archived successfully'
    });
  } catch (error) {
    logger.error('Error archiving user:', error);
    next(error);
  }
};

// Restore archived user
exports.restoreUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is actually archived
    if (!user.deletedAt) {
      throw new ValidationError('User is not archived');
    }

    // Restore user
    user.deletedAt = null;
    user.isActive = true;
    await user.save();

    logger.info(`Admin ${req.user.userId} restored user ${id}`);

    res.json({
      status: 'success',
      message: 'User restored successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          deletedAt: user.deletedAt
        }
      }
    });
  } catch (error) {
    logger.error('Error restoring user:', error);
    next(error);
  }
};

// Permanently delete user (hard delete)
exports.permanentlyDeleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent admin from permanently deleting themselves
    if (id === req.user.userId) {
      throw new ValidationError('You cannot permanently delete your own account');
    }

    // Only allow permanent deletion of archived users
    if (!user.deletedAt) {
      throw new ValidationError('User must be archived first before permanent deletion');
    }

    await User.findByIdAndDelete(id);

    logger.info(`Admin ${req.user.userId} permanently deleted user ${id}`);

    res.json({
      status: 'success',
      message: 'User permanently deleted successfully'
    });
  } catch (error) {
    logger.error('Error permanently deleting user:', error);
    next(error);
  }
};

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    // Count only non-deleted users for total
    const totalUsers = await User.countDocuments({ deletedAt: null });
    const activeUsers = await User.countDocuments({ isActive: true, deletedAt: null });
    const inactiveUsers = await User.countDocuments({ isActive: false, deletedAt: null });
    const archivedUsers = await User.countDocuments({ deletedAt: { $ne: null } });
    const adminUsers = await User.countDocuments({ role: 'admin', deletedAt: null });
    const regularUsers = await User.countDocuments({ role: 'user', deletedAt: null });

    // Get recent registrations (last 30 days) - exclude deleted users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      deletedAt: null
    });

    // Get monthly user growth - exclude deleted users
    const monthlyStats = await User.aggregate([
      {
        $match: { deletedAt: null }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    logger.info(`Admin ${req.user.userId} retrieved user statistics`);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          archivedUsers,
          adminUsers,
          regularUsers,
          recentRegistrations
        },
        monthlyGrowth: monthlyStats.reverse()
      }
    });
  } catch (error) {
    logger.error('Error getting user statistics:', error);
    next(error);
  }
};
