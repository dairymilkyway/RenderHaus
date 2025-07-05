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
  ChevronDownIcon
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
                Welcome back, <span className="user-name-highlight">{user.name}</span>!
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
                    <UserCircleIcon className="nav-icon" />
                    <span className="nav-user-role">{user.role}</span>
                    <ChevronDownIcon className="nav-icon-small" />
                  </div>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <span className="dropdown-user-name">{user.name}</span>
                      <span className="dropdown-user-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <NavLink to="/profile" className="dropdown-item">
                      <UserCircleIcon className="nav-icon" />
                      Profile
                    </NavLink>
                    <button 
                      className="dropdown-item text-red" 
                      onClick={() => {
                        onLogout();
                        setShowDropdown(false);
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="nav-icon" />
                      Logout
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