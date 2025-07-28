import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './Sidebar';
import {
  ChartBarIcon,
  UserGroupIcon,
  FolderIcon,
  CubeIcon,
  HomeIcon,
  DocumentArrowDownIcon,
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
        const [userResponse, projectResponse, modelResponse] = await Promise.all([
          fetch('/api/dashboard/stats/users', { headers }),
          fetch('/api/dashboard/stats/projects', { headers }),
          fetch('/api/dashboard/stats/models', { headers })
        ]);

        if (!userResponse.ok || !projectResponse.ok || !modelResponse.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const userData = await userResponse.json();
        const projectData = await projectResponse.json();
        const modelData = await modelResponse.json();

        console.log('User data received:', userData);
        console.log('Project data received:', projectData);
        console.log('Model data received:', modelData);

        // Map the API response structure to what the component expects
        const mappedUserStats = {
          total: userData.data?.overview?.totalUsers || 0,
          active: userData.data?.overview?.activeUsers || 0,
          inactive: userData.data?.overview?.inactiveUsers || 0,
          recent: userData.data?.overview?.recentRegistrations || 0,
          monthlyTrend: userData.data?.monthlyTrend || []
        };

        const mappedProjectStats = {
          total: projectData.data?.overview?.totalProjects || 0,
          thisMonth: projectData.data?.overview?.recentProjects || 0,
          thisWeek: projectData.data?.overview?.recentProjects || 0, // Using same data for now
          componentsUsage: projectData.data?.componentsUsage || [],
          monthlyTrend: projectData.data?.monthlyTrend || [],
          mostActiveUser: projectData.data?.mostActiveUser || { count: 0 }
        };

        const mappedModelStats = {
          model3dCount: modelData.data?.overview?.totalModel3D || 0,
          componentCount: modelData.data?.overview?.totalComponents || 0,
          model3dThisMonth: modelData.data?.overview?.recentUploads || 0,
          componentThisMonth: modelData.data?.overview?.recentUploads || 0,
          categoryBreakdown: modelData.data?.categoryBreakdown || {},
          roomTemplateUsage: modelData.data?.roomTemplateUsage || [],
          componentUsage: modelData.data?.componentUsage || []
        };

        console.log('Mapped user stats:', mappedUserStats);
        console.log('Mapped project stats:', mappedProjectStats);
        console.log('Mapped model stats:', mappedModelStats);

        setUserStats(mappedUserStats);
        setProjectStats(mappedProjectStats);
        setModelStats(mappedModelStats);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Failed to load statistics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  // Export all reports to PDF
  const exportToPDF = async () => {
    try {
      // Check if data is loaded
      if (!userStats || !projectStats || !modelStats) {
        alert('Please wait for data to load before exporting.');
        return;
      }

      // Show loading state
      const exportButton = document.querySelector('.export-pdf-button');
      const originalText = exportButton.innerHTML;
      exportButton.innerHTML = '<div class="loading-spinner"></div> Generating PDF...';
      exportButton.disabled = true;

      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title and timestamp
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('RenderHaus Admin Reports', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${timestamp}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // Overview Section
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Overview Statistics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      
      // Overview stats with proper fallbacks
      const overviewData = [
        `Total Users: ${userStats?.total || 0}`,
        `Active Users: ${userStats?.active || 0}`,
        `Total Projects: ${projectStats?.total || 0}`,
        `Total Room Templates: ${modelStats?.model3dCount || 0}`,
        `Total Components: ${modelStats?.componentCount || 0}`,
        `Total 3D Models: ${(modelStats?.model3dCount || 0) + (modelStats?.componentCount || 0)}`
      ];

      // Check if all values are zero (might indicate no data)
      const hasData = overviewData.some(line => {
        const value = parseInt(line.split(': ')[1]);
        return value > 0;
      });

      if (!hasData) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'italic');
        pdf.text('Note: No data available or database connection issue.', 20, yPosition);
        pdf.text('Please ensure the database is connected and contains data.', 20, yPosition + 8);
        yPosition += 20;
      }

      overviewData.forEach((line, index) => {
        pdf.text(line, 20, yPosition + (index * 8));
      });
      
      yPosition += overviewData.length * 8 + 20;

      // Add charts to PDF
      try {
        // Capture charts as images
        const chartElements = document.querySelectorAll('.chart-container canvas');
        
        for (let i = 0; i < chartElements.length; i++) {
          const canvas = chartElements[i];
          if (canvas) {
            // Check if we need a new page
            if (yPosition > pageHeight - 80) {
              pdf.addPage();
              yPosition = 20;
            }

            // Get chart title from parent container
            const chartContainer = canvas.closest('.chart-container');
            const chartTitle = chartContainer?.querySelector('h3')?.textContent || `Chart ${i + 1}`;
            
            pdf.setFontSize(14);
            pdf.setFont(undefined, 'bold');
            pdf.text(chartTitle, 20, yPosition);
            yPosition += 10;

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170; // Width in mm
            const imgHeight = 100; // Height in mm
            
            pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
          }
        }
      } catch (chartError) {
        console.warn('Could not capture charts:', chartError);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'italic');
        pdf.text('Note: Charts could not be included in this export.', 20, yPosition);
        yPosition += 15;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }

      // User Statistics
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('User Statistics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      
      const userLines = [
        `Total Registered Users: ${userStats?.total || 0}`,
        `Active Users: ${userStats?.active || 0}`,
        `Inactive Users: ${Math.max(0, (userStats?.total || 0) - (userStats?.active || 0))}`,
        `Average Projects per User: ${userStats?.total > 0 ? ((projectStats?.total || 0) / userStats.total).toFixed(2) : '0'}`
      ];

      userLines.forEach((line, index) => {
        pdf.text(line, 25, yPosition + (index * 8));
      });
      
      yPosition += userLines.length * 8 + 15;

      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      // Project Statistics
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Project Statistics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      
      const projectLines = [
        `Total Projects: ${projectStats?.total || 0}`,
        `Projects This Month: ${projectStats?.thisMonth || 0}`,
        `Projects This Week: ${projectStats?.thisWeek || 0}`,
        `Most Active User Projects: ${projectStats?.mostActiveUser?.count || 0} projects`
      ];

      projectLines.forEach((line, index) => {
        pdf.text(line, 25, yPosition + (index * 8));
      });
      
      yPosition += projectLines.length * 8 + 15;

      // 3D Component Usage
      if (projectStats?.componentUsage && projectStats.componentUsage.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Most Used 3D Components:', 25, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        
        const topComponents = projectStats.componentUsage.slice(0, 10);
        topComponents.forEach((component, index) => {
          pdf.text(`${index + 1}. ${component._id || component.name || 'Unknown'}: ${component.count || 0} times`, 30, yPosition + (index * 6));
        });
        
        yPosition += topComponents.length * 6 + 15;
      }

      // Also include room template usage if available
      if (modelStats?.roomTemplateUsage && modelStats.roomTemplateUsage.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Most Used Room Templates:', 25, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        
        const topTemplates = modelStats.roomTemplateUsage.slice(0, 10);
        topTemplates.forEach((template, index) => {
          pdf.text(`${index + 1}. ${template._id || template.name || 'Unknown'}: ${template.count || 0} times`, 30, yPosition + (index * 6));
        });
        
        yPosition += topTemplates.length * 6 + 15;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      // Model Statistics
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('3D Model Statistics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      
      const modelLines = [
        `Total Room Templates (Model3D): ${modelStats?.model3dCount || 0}`,
        `Total Components: ${modelStats?.componentCount || 0}`,
        `Room Templates This Month: ${modelStats?.model3dThisMonth || 0}`,
        `Components This Month: ${modelStats?.componentThisMonth || 0}`,
        `Total 3D Assets: ${(modelStats?.model3dCount || 0) + (modelStats?.componentCount || 0)}`
      ];

      modelLines.forEach((line, index) => {
        pdf.text(line, 25, yPosition + (index * 8));
      });
      
      yPosition += modelLines.length * 8 + 15;

      // Category breakdown
      if (modelStats?.categoryBreakdown && Object.keys(modelStats.categoryBreakdown).length > 0) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Models by Category:', 25, yPosition);
        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        
        Object.entries(modelStats.categoryBreakdown).forEach(([category, count], index) => {
          pdf.text(`${category}: ${count} models`, 30, yPosition + (index * 6));
        });
        
        yPosition += Object.keys(modelStats.categoryBreakdown).length * 6 + 15;
      }

      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: 'right' });
        pdf.text('RenderHaus Admin Dashboard', 20, pageHeight - 10);
      }

      // Save the PDF
      const filename = `RenderHaus_Admin_Reports_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      // Reset button state
      exportButton.innerHTML = originalText;
      exportButton.disabled = false;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
      
      // Reset button state on error
      const exportButton = document.querySelector('.export-pdf-button');
      if (exportButton) {
        exportButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export to PDF';
        exportButton.disabled = false;
      }
    }
  };

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
        data: [userStats.active || 0, userStats.inactive || 0],
        backgroundColor: [colors.secondary, colors.danger],
        borderWidth: 0
      }]
    };

    return { userGrowthChart, userStatusChart };
  };

  // Project Analytics Charts
  const getProjectAnalytics = () => {
    if (!projectStats) return null;

    console.log('🔍 Project Stats Data:', projectStats);
    console.log('🔍 Components Usage:', projectStats.componentsUsage);

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

    const componentsUsageChart = {
      labels: projectStats.componentsUsage?.length > 0 
        ? projectStats.componentsUsage.map(item => `${item._id || 0} Components`)
        : ['No Data'],
      datasets: [{
        data: projectStats.componentsUsage?.length > 0 
          ? projectStats.componentsUsage.map(item => item.count)
          : [1],
        backgroundColor: projectStats.componentsUsage?.length > 0 
          ? [colors.primary, colors.secondary, colors.accent, colors.purple, colors.teal]
          : [colors.secondary],
        borderWidth: 0
      }]
    };

    console.log('🔍 Components Usage Chart Data:', componentsUsageChart);

    return { projectGrowthChart, componentsUsageChart };
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

    // Room Templates Usage Chart (most used Model3Ds from projects)
    const roomTemplateChart = {
      labels: modelStats.roomTemplateUsage?.length > 0 
        ? modelStats.roomTemplateUsage.map(item => item._id || 'Unknown')
        : ['No Data'],
      datasets: [{
        label: 'Usage Count',
        data: modelStats.roomTemplateUsage?.length > 0 
          ? modelStats.roomTemplateUsage.map(item => item.count)
          : [1],
        backgroundColor: modelStats.roomTemplateUsage?.length > 0 
          ? [colors.primary, colors.secondary, colors.accent, colors.purple, colors.indigo, colors.pink, colors.teal, colors.danger]
          : [colors.secondary],
        borderWidth: 2
      }]
    };

    // Components Usage Chart (most used Components from projects)
    const componentUsageChart = {
      labels: modelStats.componentUsage?.length > 0 
        ? modelStats.componentUsage.map(item => item._id || 'Unknown')
        : ['No Data'],
      datasets: [{
        data: modelStats.componentUsage?.length > 0 
          ? modelStats.componentUsage.map(item => item.count)
          : [1],
        backgroundColor: modelStats.componentUsage?.length > 0 
          ? [colors.primary, colors.secondary, colors.accent, colors.purple, colors.indigo, colors.pink, colors.teal, colors.danger]
          : [colors.secondary],
        borderWidth: 0
      }]
    };

    return { modelGrowthChart, roomTemplateChart, componentUsageChart };
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
        <div className="tab-buttons">
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
            className={`tab-button ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <CubeIcon className="w-4 h-4" />
            Room Templates
          </button>
        </div>
        
        <div className="tab-actions">
          <button 
            className="export-pdf-button"
            onClick={exportToPDF}
            disabled={loading}
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{userStats?.total || 0}</p>
              <span className="stat-label">Active: {userStats?.active || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Total Projects</h3>
              <p className="stat-number">{projectStats?.total || 0}</p>
              <span className="stat-label">Recent: {projectStats?.thisMonth || 0}</span>
            </div>
            <div className="stat-card">
              <h3>Room Templates</h3>
              <p className="stat-number">{(modelStats?.model3dCount || 0) + (modelStats?.componentCount || 0)}</p>
              <span className="stat-label">Recent: {modelStats?.model3dThisMonth || 0}</span>
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
            
            <div className="chart-container">
              <h3>User Status Distribution</h3>
              {userCharts && (
                <Doughnut 
                  data={userCharts.userStatusChart} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Active vs Inactive Users' }
                    }
                  }} 
                />
              )}
            </div>

            <div className="chart-container">
              <h3>3D Components Usage</h3>
              {projectCharts && (
                <Bar 
                  data={projectCharts.componentsUsageChart} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: 'Most Used Component Counts' }
                    }
                  }} 
                />
              )}
            </div>

            <div className="chart-container">
              <h3>3D Model Growth</h3>
              {modelCharts && (
                <Line 
                  data={modelCharts.modelGrowthChart} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Model & Component Upload Trends' }
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
                  <p>{userStats.total}</p>
                </div>
                <div className="stat-item">
                  <h4>Active Users</h4>
                  <p>{userStats.active}</p>
                </div>
                <div className="stat-item">
                  <h4>Inactive Users</h4>
                  <p>{userStats.inactive}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Registrations</h4>
                  <p>{userStats.recent}</p>
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
                  <p>{projectStats.total}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Projects</h4>
                  <p>{projectStats.thisMonth}</p>
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
                <h3>3D Components Usage</h3>
                <Doughnut 
                  data={projectCharts.componentsUsageChart} 
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

      {/* Room Templates Tab */}
      {activeTab === 'models' && modelCharts && (
        <div className="tab-content">
          <div className="model-analytics">
            <div className="analytics-section">
              <h2>Room Templates Analytics (Components + Model3D)</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Total Models</h4>
                  <p>{(modelStats.model3dCount || 0) + (modelStats.componentCount || 0)}</p>
                </div>
                <div className="stat-item">
                  <h4>3D Models</h4>
                  <p>{modelStats.model3dCount}</p>
                </div>
                <div className="stat-item">
                  <h4>Components</h4>
                  <p>{modelStats.componentCount}</p>
                </div>
                <div className="stat-item">
                  <h4>Recent Uploads</h4>
                  <p>{(modelStats.model3dThisMonth || 0) + (modelStats.componentThisMonth || 0)}</p>
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
                <h3>Models by Room Templates</h3>
                <Bar 
                  data={modelCharts.roomTemplateChart} 
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
                <h3>Models by Components</h3>
                <Doughnut 
                  data={modelCharts.componentUsageChart} 
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
