import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import './css/AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      name: 'Users',
      icon: UserGroupIcon,
      path: '/admin/users'
    },
    {
      id: 'models',
      name: '3D Models',
      icon: CubeIcon,
      path: '/admin/models'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: ChartBarIcon,
      path: '/admin/reports'
    }
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <span className="admin-logo-text">RenderHaus</span>
          <span className="admin-logo-badge">Admin</span>
        </div>
      </div>
      
      <nav className="admin-nav">
        <div className="admin-nav-section">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="admin-nav-icon" />
                <span className="admin-nav-text">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
