const express = require('express');
const User = require('../models/User');
const Component = require('../models/Component');
const Model3D = require('../models/Model3D');
const HouseTemplate = require('../models/HouseTemplate');
const Project = require('../models/Project');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get detailed user statistics
router.get('/stats/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ isActive: true, role: { $ne: 'admin' } });
    const inactiveUsers = await User.countDocuments({ isActive: false, role: { $ne: 'admin' } });

    // Monthly user registrations for the last 12 months
    const monthlyRegistrations = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          recentRegistrations
        },
        monthlyTrend: monthlyRegistrations.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
});

// Get detailed project statistics
router.get('/stats/projects', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalProjects = await Project.countDocuments();
    
    // Projects by type
    const projectsByType = await Project.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly project creation trend
    const monthlyProjects = await Project.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Recent projects (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentProjects = await Project.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalProjects,
          recentProjects
        },
        typeDistribution: projectsByType,
        monthlyTrend: monthlyProjects.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({ message: 'Error fetching project statistics' });
  }
});

// Get detailed house template statistics
router.get('/stats/house-templates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalTemplates = await HouseTemplate.countDocuments();
    
    // Templates by bedroom count
    const templatesByBedrooms = await HouseTemplate.aggregate([
      { $group: { _id: '$specifications.bedrooms', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Templates by floor count
    const templatesByFloors = await HouseTemplate.aggregate([
      { $group: { _id: '$specifications.floors', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Monthly template creation trend
    const monthlyTemplates = await HouseTemplate.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Recent templates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTemplates = await HouseTemplate.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalTemplates,
          recentTemplates
        },
        bedroomDistribution: templatesByBedrooms,
        floorDistribution: templatesByFloors,
        monthlyTrend: monthlyTemplates.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching house template statistics:', error);
    res.status(500).json({ message: 'Error fetching house template statistics' });
  }
});

// Get detailed 3D model statistics
router.get('/stats/models', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalModel3D = await Model3D.countDocuments();
    const totalComponents = await Component.countDocuments();
    const totalModels = totalModel3D + totalComponents;
    const activeModels = await Model3D.countDocuments({ isActive: true });

    // Models by category
    const modelsByCategory = await Model3D.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Components by category (if applicable)
    const componentsByCategory = await Component.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly model upload trend
    const monthlyModel3D = await Model3D.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const monthlyComponents = await Component.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Recent uploads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentModel3D = await Model3D.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const recentComponents = await Component.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      status: 'success',
      data: {
        overview: {
          totalModels,
          totalModel3D,
          totalComponents,
          activeModels,
          recentUploads: recentModel3D + recentComponents
        },
        model3DCategoryDistribution: modelsByCategory,
        componentCategoryDistribution: componentsByCategory,
        monthlyModel3DTrend: monthlyModel3D.reverse(),
        monthlyComponentTrend: monthlyComponents.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching 3D model statistics:', error);
    res.status(500).json({ message: 'Error fetching 3D model statistics' });
  }
});

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  console.log('=== DASHBOARD API CALLED ===');
  console.log('User:', req.user);
  console.log('User Role:', req.user?.role);
  
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('❌ Access denied - User is not admin');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    console.log('✅ Admin access confirmed - Fetching dashboard stats...');

    // Get total users (excluding admin users)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Get total 3D models (Components + Model3D)
    const totalComponents = await Component.countDocuments();
    const totalModel3D = await Model3D.countDocuments();
    const total3DModels = totalComponents + totalModel3D;

    // Get total projects (assuming projects are user-created models/components)
    // This might need adjustment based on your actual project model structure
    const totalProjects = await Component.countDocuments({ createdBy: { $exists: true } });

    // Get total house templates
    const totalHouseTemplates = await HouseTemplate.countDocuments();

    console.log('📊 Database counts:');
    console.log('- Total Users (non-admin):', totalUsers);
    console.log('- Total Components:', totalComponents);
    console.log('- Total Model3D:', totalModel3D);
    console.log('- Total 3D Models:', total3DModels);
    console.log('- Total Projects:', totalProjects);
    console.log('- Total House Templates:', totalHouseTemplates);

    // Calculate growth percentages (simplified version)
    // In a real application, you'd compare with previous periods
    const userGrowth = Math.floor(Math.random() * 15) + 5; // 5-20% growth
    const projectGrowth = Math.floor(Math.random() * 10) + 2; // 2-12% growth

    const responseData = {
      totalUsers,
      total3DModels,
      totalProjects,
      totalHouseTemplates,
      userGrowth,
      projectGrowth
    };

    console.log('🚀 Sending response:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get recent activities
router.get('/recent-activity', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const activities = [];

    // Get recent user registrations
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    recentUsers.forEach(user => {
      activities.push({
        id: `user-${user._id}`,
        action: 'New user registered',
        user: user.name || user.email.split('@')[0],
        time: getTimeAgo(user.createdAt),
        type: 'user',
        createdAt: user.createdAt
      });
    });

    // Get recent components/models created
    const recentComponents = await Component.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    recentComponents.forEach(component => {
      activities.push({
        id: `component-${component._id}`,
        action: 'New 3D model uploaded',
        user: 'System', // Since Component doesn't have createdBy field
        time: getTimeAgo(component.createdAt),
        type: 'model',
        createdAt: component.createdAt
      });
    });

    // Get recent house templates
    const recentTemplates = await HouseTemplate.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    recentTemplates.forEach(template => {
      activities.push({
        id: `template-${template._id}`,
        action: 'House template created',
        user: 'System', // Since HouseTemplate doesn't have createdBy field
        time: getTimeAgo(template.createdAt),
        type: 'template',
        createdAt: template.createdAt
      });
    });

    // Sort activities by creation date (most recent first) and limit to 15
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, 15);

    res.json(recentActivities);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
});

// Get growth analytics
router.get('/growth-analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get user growth data
    const currentMonthUsers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const previousMonthUsers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    // Get component/3D model growth data
    const currentMonthComponents = await Component.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const previousMonthComponents = await Component.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const currentMonthModel3D = await Model3D.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const previousMonthModel3D = await Model3D.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    // Get house template (projects) growth data
    const currentMonthProjects = await HouseTemplate.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const previousMonthProjects = await HouseTemplate.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowth = calculateGrowth(currentMonthUsers, previousMonthUsers);
    const modelsGrowth = calculateGrowth(
      currentMonthComponents + currentMonthModel3D,
      previousMonthComponents + previousMonthModel3D
    );
    const projectsGrowth = calculateGrowth(currentMonthProjects, previousMonthProjects);

    // Generate chart data for the last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dayUsers = await User.countDocuments({
        role: { $ne: 'admin' },
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const dayComponents = await Component.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const dayModel3D = await Model3D.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const dayProjects = await HouseTemplate.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      chartData.push({
        date: startOfDay.toISOString().split('T')[0],
        users: dayUsers,
        models: dayComponents + dayModel3D,
        projects: dayProjects
      });
    }

    const analytics = {
      userGrowth: {
        current: currentMonthUsers,
        previous: previousMonthUsers,
        percentage: userGrowth,
        trend: userGrowth >= 0 ? 'up' : 'down'
      },
      modelsGrowth: {
        current: currentMonthComponents + currentMonthModel3D,
        previous: previousMonthComponents + previousMonthModel3D,
        percentage: modelsGrowth,
        trend: modelsGrowth >= 0 ? 'up' : 'down'
      },
      projectsGrowth: {
        current: currentMonthProjects,
        previous: previousMonthProjects,
        percentage: projectsGrowth,
        trend: projectsGrowth >= 0 ? 'up' : 'down'
      },
      chartData
    };

    res.json(analytics);

  } catch (error) {
    console.error('Error fetching growth analytics:', error);
    res.status(500).json({ message: 'Error fetching growth analytics' });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return new Date(date).toLocaleDateString();
  }
}

module.exports = router;
