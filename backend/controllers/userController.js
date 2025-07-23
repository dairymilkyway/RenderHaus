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
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.isActive = status === 'active';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

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

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
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
    const { name, email, role } = req.body;

    // Validate input
    if (!name || !email) {
      throw new ValidationError('Name and email are required');
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email, 
      _id: { $ne: id } 
    });
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');

    logger.info(`Admin ${req.user.userId} updated user ${id}`);

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

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      throw new ValidationError('You cannot delete your own account');
    }

    await User.findByIdAndDelete(id);

    logger.info(`Admin ${req.user.userId} deleted user ${id}`);

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get monthly user growth
    const monthlyStats = await User.aggregate([
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
