import React, { useState, useEffect } from 'react';
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import './css/AdminNavbar.css';

const AdminNavbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get user data from localStorage or context
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'A'; // Default to 'A' for Admin if name is not available
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    // Confirm logout
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        // Clear all authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Clear user state
        setUser(null);
        
        // Dispatch a custom event to notify App.js about logout
        window.dispatchEvent(new Event('userLogout'));
        
        // Use window.location.href for reliable redirect (consistent with Login component)
        window.location.href = '/auth';
        
      } catch (error) {
        console.error('Logout error:', error);
        // Force hard redirect as fallback
        window.location.href = '/auth';
      }
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.admin-user-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-left">
        <h1 className="admin-page-title">Admin Dashboard</h1>
      </div>

      <div className="admin-navbar-right">
        {/* User Menu */}
        <div className="admin-user-menu">
          <button 
            className="admin-user-button"
            onClick={toggleDropdown}
          >
            <div className="admin-user-avatar">
              {user ? getInitials(user.name) : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">
                {user ? user.name : 'Admin User'}
              </span>
              <span className="admin-user-role">
                {user ? user.role : 'admin'}
              </span>
            </div>
            <ChevronDownIcon className="admin-dropdown-icon" />
          </button>

          {showDropdown && (
            <div className="admin-dropdown-menu">
              <button 
                className="admin-dropdown-item logout"
                onClick={handleLogout}
              >
                <ArrowRightOnRectangleIcon className="admin-dropdown-item-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
