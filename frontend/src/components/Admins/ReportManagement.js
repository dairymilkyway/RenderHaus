import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './Sidebar';
import {
  ChartBarIcon,
  UserGroupIcon,
  FolderIcon,
  CubeIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './css/ReportManagement.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportManagement = () => {
  const [userStats, setUserStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [houseTemplateStats, setHouseTemplateStats] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all statistics data
  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch all stats in parallel
        const [userResponse, projectResponse, templateResponse, modelResponse] = await Promise.all([
          fetch('/api/dashboard/stats/users', { headers }),
          fetch('/api/dashboard/stats/projects', { headers }),
          fetch('/api/dashboard/stats/house-templates', { headers }),
          fetch('/api/dashboard/stats/models', { headers })
        ]);

        if (!userResponse.ok || !projectResponse.ok || !templateResponse.ok || !modelResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const userData = await userResponse.json();
        const projectData = await projectResponse.json();
        const templateData = await templateResponse.json();
        const modelData = await modelResponse.json();

        setUserStats(userData.data);
        setProjectStats(projectData.data);
        setHouseTemplateStats(templateData.data);
        setModelStats(modelData.data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load statistics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  // Chart color schemes
  const colors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    indigo: '#6366f1',
    pink: '#ec4899',
    teal: '#14b8a6'
  };

  // Helper function to format month data
  const formatMonthlyData = (monthlyData) => {
    if (!monthlyData || monthlyData.length === 0) return { labels: [], data: [] };
    
    const labels = monthlyData.map(item => {
      const month = new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      return month;
    });
    
    const data = monthlyData.map(item => item.count);
    return { labels, data };
  };

  // User Analytics Charts
  const getUserAnalytics = () => {
    if (!userStats) return null;

    const monthlyData = formatMonthlyData(userStats.monthlyTrend);
    
    const userGrowthChart = {
      labels: monthlyData.labels,
      datasets: [{
        label: 'New User Registrations',
        data: monthlyData.data,
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}20`,
        tension: 0.4,
        fill: true
      }]
    };

    const userStatusChart = {
      labels: ['Active Users', 'Inactive Users'],
      datasets: [{
        data: [userStats.overview.activeUsers, userStats.overview.inactiveUsers],
        backgroundColor: [colors.secondary, colors.danger],
        borderWidth: 0
      }]
    };

    return { userGrowthChart, userStatusChart };
  };

  // Project Analytics Charts
  const getProjectAnalytics = () => {
    if (!projectStats) return null;

    const monthlyData = formatMonthlyData(projectStats.monthlyTrend);
    
    const projectGrowthChart = {
      labels: monthlyData.labels,
      datasets: [{
        label: 'Projects Created',
        data: monthlyData.data,
        backgroundColor: colors.accent,
        borderColor: colors.accent,
        borderWidth: 2
      }]
    };

    const projectTypeChart = {
      labels: projectStats.typeDistribution?.map(item => item._id || 'Unknown') || [],
      datasets: [{
        data: projectStats.typeDistribution?.map(item => item.count) || [],
        backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.purple],
        borderWidth: 0
      }]
    };

    return { projectGrowthChart, projectTypeChart };
  };

  // House Template Analytics Charts
  const getHouseTemplateAnalytics = () => {
    if (!houseTemplateStats) return null;

    const monthlyData = formatMonthlyData(houseTemplateStats.monthlyTrend);
    
    const templateGrowthChart = {
      labels: monthlyData.labels,
      datasets: [{
        label: 'Templates Created',
        data: monthlyData.data,
        borderColor: colors.purple,
        backgroundColor: `${colors.purple}20`,
        tension: 0.4,
        fill: true
      }]
    };

    const bedroomChart = {
      labels: houseTemplateStats.bedroomDistribution?.map(item => `${item._id || 0} Bedrooms`) || [],
      datasets: [{
        label: 'Templates by Bedrooms',
        data: houseTemplateStats.bedroomDistribution?.map(item => item.count) || [],
        backgroundColor: colors.indigo,
        borderColor: colors.indigo,
        borderWidth: 2
      }]
    };

    const floorChart = {
      labels: houseTemplateStats.floorDistribution?.map(item => `${item._id || 1} ${item._id === 1 ? 'Floor' : 'Floors'}`) || [],
      datasets: [{
        data: houseTemplateStats.floorDistribution?.map(item => item.count) || [],
        backgroundColor: [colors.teal, colors.pink, colors.accent, colors.danger],
        borderWidth: 0
      }]
    };

    return { templateGrowthChart, bedroomChart, floorChart };
  };

  // 3D Model Analytics Charts
  const getModelAnalytics = () => {
    if (!modelStats) return null;

    const model3DData = formatMonthlyData(modelStats.monthlyModel3DTrend);
    const componentData = formatMonthlyData(modelStats.monthlyComponentTrend);
    
    const modelGrowthChart = {
      labels: model3DData.labels,
      datasets: [
        {
          label: '3D Models',
          data: model3DData.data,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}20`,
          tension: 0.4
        },
        {
          label: 'Components',
          data: componentData.data,
          borderColor: colors.secondary,
          backgroundColor: `${colors.secondary}20`,
          tension: 0.4
        }
      ]
    };

    const categoryChart = {
      labels: modelStats.model3DCategoryDistribution?.map(item => item._id) || [],
      datasets: [{
        label: 'Models by Category',
        data: modelStats.model3DCategoryDistribution?.map(item => item.count) || [],
        backgroundColor: [
          colors.primary, colors.secondary, colors.accent, colors.purple,
          colors.indigo, colors.pink, colors.teal, colors.danger
        ],
        borderWidth: 2
      }]
    };

    const modelOverviewChart = {
      labels: ['3D Models', 'Components', 'Active Models'],
      datasets: [{
        data: [
          modelStats.overview.totalModel3D,
          modelStats.overview.totalComponents,
          modelStats.overview.activeModels
        ],
        backgroundColor: [colors.primary, colors.secondary, colors.accent],
        borderWidth: 0
      }]
    };

    return { modelGrowthChart, categoryChart, modelOverviewChart };
  };

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-error">
        <h3>Error Loading Reports</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const userCharts = getUserAnalytics();
  const projectCharts = getProjectAnalytics();
  const templateCharts = getHouseTemplateAnalytics();
  const modelCharts = getModelAnalytics();

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-content">
        <AdminNavbar />
        
        <div className="admin-main">
          <div className="report-management">
            <div className="page-header">
              <div className="header-content">
                <div className="header-text">
                  <h1 className="page-title">
                    <ChartBarIcon className="page-icon" />
                    Analytics & Reports
                  </h1>
                  <p className="page-subtitle">
                    Comprehensive insights into your platform's performance
                  </p>
                </div>
              </div>
            </div>

      {/* Tab Navigation */}
      <div className="report-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <HomeIcon className="w-4 h-4" />
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UserGroupIcon className="w-4 h-4" />
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderIcon className="w-4 h-4" />
          Projects
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <HomeIcon className="w-4 h-4" />
          House Templates
        </button>
        <button 
          className={`tab-button ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          <CubeIcon className="w-4 h-4" />
          3D Models
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{userStats?.overview.totalUsers || 0}</p>
              <span className="stat-label">Active: {userStats?.overview.activeUsers || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Total Projects</h3>
              <p className="stat-number">{projectStats?.overview.totalProjects || 0}</p>
              <span className="stat-label">Recent: {projectStats?.overview.recentProjects || 0}</span>
            </div>
            <div className="stat-card">
              <h3>House Templates</h3>
              <p className="stat-number">{houseTemplateStats?.overview.totalTemplates || 0}</p>
              <span className="stat-label">Recent: {houseTemplateStats?.overview.recentTemplates || 0}</span>
            </div>
            <div className="stat-card">
              <h3>3D Models</h3>
              <p className="stat-number">{modelStats?.overview.totalModels || 0}</p>
              <span className="stat-label">Recent: {modelStats?.overview.recentUploads || 0}</span>
            </div>
          </div>
          
          <div className="overview-charts">
            <div className="chart-container">
              <h3>Platform Growth Trends</h3>
              {userCharts && (
                <Line 
                  data={userCharts.userGrowthChart} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'User Registration Trend' }
                    }
                  }} 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && userCharts && (
        <div className="tab-content">
          <div className="user-analytics">
            <div className="analytics-section">
              <h2>User Analytics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Total Users</h4>
                  <p>{userStats.overview.totalUsers}</p>
                </div>
                <div className="stat-item">
                  <h4>Active Users</h4>
                  <p>{userStats.overview.activeUsers}</p>
                </div>
                <div className="stat-item">
                  <h4>Inactive Users</h4>
                  <p>{userStats.overview.inactiveUsers}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Registrations</h4>
                  <p>{userStats.overview.recentRegistrations}</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>User Registration Trend</h3>
                <Line 
                  data={userCharts.userGrowthChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }} 
                />
              </div>
              <div className="chart-container">
                <h3>User Status Distribution</h3>
                <Doughnut 
                  data={userCharts.userStatusChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && projectCharts && (
        <div className="tab-content">
          <div className="project-analytics">
            <div className="analytics-section">
              <h2>Project Analytics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Total Projects</h4>
                  <p>{projectStats.overview.totalProjects}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Projects</h4>
                  <p>{projectStats.overview.recentProjects}</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Project Creation Trend</h3>
                <Bar 
                  data={projectCharts.projectGrowthChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }} 
                />
              </div>
              <div className="chart-container">
                <h3>Projects by Type</h3>
                <Doughnut 
                  data={projectCharts.projectTypeChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* House Templates Tab */}
      {activeTab === 'templates' && templateCharts && (
        <div className="tab-content">
          <div className="template-analytics">
            <div className="analytics-section">
              <h2>House Template Analytics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Total Templates</h4>
                  <p>{houseTemplateStats.overview.totalTemplates}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Templates</h4>
                  <p>{houseTemplateStats.overview.recentTemplates}</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Template Creation Trend</h3>
                <Line 
                  data={templateCharts.templateGrowthChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }} 
                />
              </div>
              <div className="chart-container">
                <h3>Templates by Bedroom Count</h3>
                <Bar 
                  data={templateCharts.bedroomChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }} 
                />
              </div>
              <div className="chart-container">
                <h3>Templates by Floor Count</h3>
                <Doughnut 
                  data={templateCharts.floorChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Models Tab */}
      {activeTab === 'models' && modelCharts && (
        <div className="tab-content">
          <div className="model-analytics">
            <div className="analytics-section">
              <h2>3D Model Analytics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Total Models</h4>
                  <p>{modelStats.overview.totalModels}</p>
                </div>
                <div className="stat-item">
                  <h4>3D Models</h4>
                  <p>{modelStats.overview.totalModel3D}</p>
                </div>
                <div className="stat-item">
                  <h4>Components</h4>
                  <p>{modelStats.overview.totalComponents}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Uploads</h4>
                  <p>{modelStats.overview.recentUploads}</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Model Upload Trends</h3>
                <Line 
                  data={modelCharts.modelGrowthChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    }
                  }} 
                />
              </div>
              <div className="chart-container">
                <h3>Models by Category</h3>
                <Bar 
                  data={modelCharts.categoryChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      x: {
                        ticks: {
                          maxRotation: 45
                        }
                      }
                    }
                  }} 
                />
              </div>
              <div className="chart-container">
                <h3>Model Overview</h3>
                <Doughnut 
                  data={modelCharts.modelOverviewChart} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
