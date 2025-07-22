import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './Sidebar';
import {
  UserGroupIcon,
  FolderIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import './css/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 1247,
    totalProjects: 89,
    activeProjects: 23,
    revenue: 15420,
    userGrowth: 12.5,
    projectGrowth: -2.3,
  });

  const [recentActivity] = useState([
    { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, action: 'Project completed', user: 'Jane Smith', time: '15 minutes ago' },
    { id: 3, action: 'New project created', user: 'Mike Johnson', time: '1 hour ago' },
    { id: 4, action: 'User subscription upgraded', user: 'Sarah Wilson', time: '2 hours ago' },
  ]);

  const [topProjects] = useState([
    { id: 1, name: 'Modern Living Room', views: 2340, status: 'Active' },
    { id: 2, name: 'Kitchen Redesign', views: 1890, status: 'Completed' },
    { id: 3, name: 'Office Space Layout', views: 1456, status: 'Active' },
    { id: 4, name: 'Bedroom Makeover', views: 1123, status: 'In Progress' },
  ]);

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
                  title="Total Projects"
                  value={stats.totalProjects}
                  icon={FolderIcon}
                  change={stats.projectGrowth}
                  changeType="negative"
                />
                <StatCard
                  title="Active Projects"
                  value={stats.activeProjects}
                  icon={ChartBarIcon}
                />
                <StatCard
                  title="Revenue"
                  value={`$${stats.revenue.toLocaleString()}`}
                  icon={CurrencyDollarIcon}
                  change={8.2}
                  changeType="positive"
                />
              </div>

              {/* Chart Section */}
              <div className="bento-item chart-section">
                <div className="section-header">
                  <h3>User Growth Analytics</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-mockup">
                    <div className="chart-bars">
                      <div className="chart-bar" style={{ height: '60%' }}></div>
                      <div className="chart-bar" style={{ height: '80%' }}></div>
                      <div className="chart-bar" style={{ height: '45%' }}></div>
                      <div className="chart-bar" style={{ height: '90%' }}></div>
                      <div className="chart-bar" style={{ height: '75%' }}></div>
                      <div className="chart-bar" style={{ height: '95%' }}></div>
                    </div>
                    <div className="chart-info">
                      <span>+{stats.userGrowth}% this month</span>
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
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-info">
                        <span className="activity-action">{activity.action}</span>
                        <span className="activity-user">by {activity.user}</span>
                      </div>
                      <div className="activity-time">
                        <ClockIcon className="time-icon" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Projects */}
              <div className="bento-item projects-section">
                <div className="section-header">
                  <h3>Top Projects</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="projects-list">
                  {topProjects.map((project) => (
                    <div key={project.id} className="project-item">
                      <div className="project-info">
                        <span className="project-name">{project.name}</span>
                        <div className="project-stats">
                          <EyeIcon className="view-icon" />
                          <span>{project.views.toLocaleString()} views</span>
                        </div>
                      </div>
                      <div className={`project-status ${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bento-item actions-section">
                <div className="section-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="action-buttons">
                  <button className="action-btn primary">
                    <UserGroupIcon className="action-icon" />
                    <span>Add New User</span>
                  </button>
                  <button className="action-btn secondary">
                    <FolderIcon className="action-icon" />
                    <span>Create Project</span>
                  </button>
                  <button className="action-btn tertiary">
                    <ChartBarIcon className="action-icon" />
                    <span>View Reports</span>
                  </button>
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
