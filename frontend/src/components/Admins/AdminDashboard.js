import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './Sidebar';
import {
  UserGroupIcon,
  FolderIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CubeIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import './css/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    total3DModels: 0,
    totalProjects: 0,
    userGrowth: 0,
    projectGrowth: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [growthAnalytics, setGrowthAnalytics] = useState({
    userGrowth: { current: 0, previous: 0, percentage: 0, trend: 'up' },
    modelsGrowth: { current: 0, previous: 0, percentage: 0, trend: 'up' },
    projectsGrowth: { current: 0, previous: 0, percentage: 0, trend: 'up' },
    chartData: []
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
    fetchGrowthAnalytics();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token || token === 'null') {
        console.error('No valid token found in localStorage');
        return;
      }

      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch dashboard stats:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token || token === 'null') {
        console.error('No valid token found in localStorage');
        return;
      }

      const response = await fetch('http://localhost:5000/api/dashboard/recent-activity', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch recent activity:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchGrowthAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token || token === 'null') {
        console.error('No valid token found in localStorage');
        return;
      }

      const response = await fetch('http://localhost:5000/api/dashboard/growth-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGrowthAnalytics(data);
      } else {
        const errorData = await response.text();
        console.error('Failed to fetch growth analytics:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching growth analytics:', error);
    }
  };

  // Function to get activity icon based on type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return UserGroupIcon;
      case 'model':
        return CubeIcon;
      case 'template':
        return HomeIcon;
      default:
        return ClockIcon;
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className="stat-icon">
          <Icon className="icon" />
        </div>
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        {change && (
          <div className={`stat-change ${changeType}`}>
            {changeType === 'positive' ? (
              <ArrowTrendingUpIcon className="change-icon" />
            ) : (
              <ArrowTrendingDownIcon className="change-icon" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      
      <div className="admin-content">
        <AdminNavbar />
        
        <div className="admin-main">
          <div className="admin-dashboard">
            {/* Bento Grid Layout */}
            <div className="bento-grid">
              {/* Stats Cards Row */}
              <div className="bento-item stat-row">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  icon={UserGroupIcon}
                  change={stats.userGrowth}
                  changeType="positive"
                />
                <StatCard
                  title="Total 3D Models"
                  value={stats.total3DModels.toLocaleString()}
                  icon={CubeIcon}
                  change={stats.projectGrowth}
                  changeType="positive"
                />
                <StatCard
                  title="Total Projects"
                  value={stats.totalProjects.toLocaleString()}
                  icon={FolderIcon}
                  change={stats.projectGrowth}
                  changeType="positive"
                />
              </div>

              {/* Growth Analytics Section */}
              <div className="bento-item chart-section">
                <div className="section-header">
                  <h3>Growth Analytics</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="analytics-content">
                  {/* Growth Cards */}
                  <div className="growth-cards">
                    <div className="growth-card">
                      <div className="growth-header">
                        <span className="growth-label">Users</span>
                        <div className={`growth-trend ${growthAnalytics.userGrowth.trend}`}>
                          {growthAnalytics.userGrowth.trend === 'up' ? (
                            <ArrowTrendingUpIcon className="trend-icon" />
                          ) : (
                            <ArrowTrendingDownIcon className="trend-icon" />
                          )}
                          <span>{Math.abs(growthAnalytics.userGrowth.percentage)}%</span>
                        </div>
                      </div>
                      <div className="growth-numbers">
                        <span className="current-number">{growthAnalytics.userGrowth.current}</span>
                        <span className="previous-number">vs {growthAnalytics.userGrowth.previous} last month</span>
                      </div>
                    </div>

                    <div className="growth-card">
                      <div className="growth-header">
                        <span className="growth-label">3D Models</span>
                        <div className={`growth-trend ${growthAnalytics.modelsGrowth.trend}`}>
                          {growthAnalytics.modelsGrowth.trend === 'up' ? (
                            <ArrowTrendingUpIcon className="trend-icon" />
                          ) : (
                            <ArrowTrendingDownIcon className="trend-icon" />
                          )}
                          <span>{Math.abs(growthAnalytics.modelsGrowth.percentage)}%</span>
                        </div>
                      </div>
                      <div className="growth-numbers">
                        <span className="current-number">{growthAnalytics.modelsGrowth.current}</span>
                        <span className="previous-number">vs {growthAnalytics.modelsGrowth.previous} last month</span>
                      </div>
                    </div>

                    <div className="growth-card">
                      <div className="growth-header">
                        <span className="growth-label">Projects</span>
                        <div className={`growth-trend ${growthAnalytics.projectsGrowth.trend}`}>
                          {growthAnalytics.projectsGrowth.trend === 'up' ? (
                            <ArrowTrendingUpIcon className="trend-icon" />
                          ) : (
                            <ArrowTrendingDownIcon className="trend-icon" />
                          )}
                          <span>{Math.abs(growthAnalytics.projectsGrowth.percentage)}%</span>
                        </div>
                      </div>
                      <div className="growth-numbers">
                        <span className="current-number">{growthAnalytics.projectsGrowth.current}</span>
                        <span className="previous-number">vs {growthAnalytics.projectsGrowth.previous} last month</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mini-chart">
                    <div className="chart-bars">
                      {growthAnalytics.chartData.map((day, index) => (
                        <div key={day.date} className="chart-day">
                          <div className="chart-bar-group">
                            <div 
                              className="chart-bar users" 
                              style={{ height: `${Math.max(20, (day.users / Math.max(...growthAnalytics.chartData.map(d => d.users), 1)) * 100)}%` }}
                              title={`${day.users} users`}
                            ></div>
                            <div 
                              className="chart-bar models" 
                              style={{ height: `${Math.max(20, (day.models / Math.max(...growthAnalytics.chartData.map(d => d.models), 1)) * 100)}%` }}
                              title={`${day.models} models`}
                            ></div>
                            <div 
                              className="chart-bar projects" 
                              style={{ height: `${Math.max(20, (day.projects / Math.max(...growthAnalytics.chartData.map(d => d.projects), 1)) * 100)}%` }}
                              title={`${day.projects} projects`}
                            ></div>
                          </div>
                          <span className="chart-label">{new Date(day.date).getDate()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color users"></div>
                        <span>Users</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color models"></div>
                        <span>Models</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color projects"></div>
                        <span>Projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bento-item activity-section">
                <div className="section-header">
                  <h3>Recent Activity</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="activity-item">
                          <div className="activity-icon">
                            <ActivityIcon className="icon" />
                          </div>
                          <div className="activity-content">
                            <div className="activity-info">
                              <span className="activity-action">{activity.action}</span>
                              <span className="activity-user">by {activity.user}</span>
                            </div>
                            <div className="activity-time">
                              <ClockIcon className="time-icon" />
                              <span>{activity.time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-activity">
                      <p>No recent activity found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
