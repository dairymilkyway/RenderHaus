import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link } from 'react-scroll';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import './css/Navbar.css';

const NavLink = ({ to, children, onClick, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <RouterLink 
      to={to} 
      className={`nav-link ${isActive ? 'active' : ''} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </RouterLink>
  );
};

const Navbar = ({ user, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default to 'U' for User if name is not available
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="nav">
      <div className="nav-content">
        <RouterLink to="/" className="nav-logo">
          <HomeIcon className="nav-icon" />
          NaviBuild
        </RouterLink>
        
        <div className="nav-links">
          {!user ? (
            <>
              <Link 
                to="features" 
                smooth={true} 
                duration={500} 
                className="nav-link"
              >
                <UserGroupIcon className="nav-icon" />
                Features
              </Link>
              <NavLink to="/about">
                <BuildingOfficeIcon className="nav-icon" />
                About
              </NavLink>
              <NavLink to="/contact">
                <EnvelopeIcon className="nav-icon" />
                Contact
              </NavLink>
              <RouterLink to="/auth" className="nav-button">
                <UserCircleIcon className="nav-icon" />
                Sign In
              </RouterLink>
            </>
          ) : (
            <div className="nav-user-section">
              <div className="welcome-message">
                Welcome back, <span className="user-name-highlight">{user.name || 'User'}</span>!
              </div>
              <NavLink to="/dashboard">
                <ChartBarIcon className="nav-icon" />
                Dashboard
              </NavLink>
              <div className="user-dropdown">
                <button 
                  className="user-dropdown-button"
                  onClick={toggleDropdown}
                >
                  <div className="user-info-compact">
                    <div className="user-avatar">
                      {getInitials(user.name)}
                    </div>
                    <div className="user-info-text">
                      <span className="nav-user-name">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                      <span className="nav-user-role">{user.role}</span>
                    </div>
                    <ChevronDownIcon className="nav-icon-small" style={{
                      transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease'
                    }} />
                  </div>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="user-avatar">
                        {getInitials(user.name)}
                      </div>
                      <span className="dropdown-user-name">{user.name || 'User'}</span>
                      <span className="dropdown-user-email">{user.email}</span>
                    </div>
                    <NavLink to="/profile" className="dropdown-item">
                      <UserCircleIcon className="nav-icon" />
                      Profile Settings
                    </NavLink>
                    <NavLink to="/settings" className="dropdown-item">
                      <Cog6ToothIcon className="nav-icon" />
                      Account Settings
                    </NavLink>
                    <div className="dropdown-divider" />
                    <button 
                      className="dropdown-item text-red" 
                      onClick={() => {
                        onLogout();
                        setShowDropdown(false);
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="nav-icon" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 