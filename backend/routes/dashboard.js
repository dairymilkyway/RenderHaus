const express = require('express');
const User = require('../models/User');
const Component = require('../models/Component');
const Model3D = require('../models/Model3D');
const HouseTemplate = require('../models/HouseTemplate');
const { auth } = require('../middleware/auth');
const router = express.Router();

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
      .limit(3)
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
      .limit(3)
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
      .limit(2)
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

    // Sort activities by creation date (most recent first) and limit to 8
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivities = activities.slice(0, 8);

    res.json(recentActivities);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Error fetching recent activities' });
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
