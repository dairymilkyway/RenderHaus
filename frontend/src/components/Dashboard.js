import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Squares2X2Icon,
  CubeIcon,
  SwatchIcon,
  CameraIcon,
  SparklesIcon,
  LightBulbIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  AcademicCapIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ShareIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import './css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState('Living Room Design');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Left Sidebar - Main Tools */}
      <div className="dashboard-sidebar">
        <div className="tool-section">
          <button className="tool-button active">
            <Squares2X2Icon className="tool-icon" />
            <span>Templates</span>
          </button>
          <button className="tool-button">
            <CubeIcon className="tool-icon" />
            <span>Components</span>
          </button>
          <button className="tool-button">
            <SwatchIcon className="tool-icon" />
            <span>Materials</span>
          </button>
          <button className="tool-button">
            <CameraIcon className="tool-icon" />
            <span>View</span>
          </button>
        </div>

        <div className="tool-section">
          <button className="tool-button ai-button">
            <SparklesIcon className="tool-icon" />
            <span>AI Suggest</span>
          </button>
          <button className="tool-button ai-button">
            <LightBulbIcon className="tool-icon" />
            <span>AI Explain</span>
          </button>
        </div>

        <div className="tool-section">
          <button className="tool-button">
            <CloudArrowUpIcon className="tool-icon" />
            <span>Save</span>
          </button>
          <button className="tool-button">
            <ShareIcon className="tool-icon" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="project-info">
            <h1>{activeProject}</h1>
            <div className="topbar-actions">
              <div className="project-actions">
                <button className="action-button">
                  <ArrowPathIcon className="action-icon" />
                  Auto-Save On
                </button>
                <button className="action-button">
                  <DocumentDuplicateIcon className="action-icon" />
                  Duplicate
                </button>
              </div>

              {/* User Profile Section */}
              <div className="user-profile">
                <div 
                  className="profile-trigger"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <span className="welcome-text">Welcome, {user?.name}</span>
                  <UserCircleIcon className="profile-icon" />
                  <ChevronDownIcon className="dropdown-icon" />
                </div>

                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <UserCircleIcon className="dropdown-profile-icon" />
                      <div className="profile-info">
                        <span className="profile-name">{user?.name}</span>
                        <span className="profile-email">{user?.email}</span>
                        <span className="profile-role">{user?.role}</span>
                      </div>
                    </div>
                    <div className="profile-menu">
                      <button className="menu-item">
                        <Cog6ToothIcon className="menu-icon" />
                        Settings
                      </button>
                      <button className="menu-item" onClick={handleLogout}>
                        <ArrowRightOnRectangleIcon className="menu-icon" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Design Canvas Area */}
        <div className="design-canvas">
          <div className="canvas-placeholder">
            <CubeIcon className="placeholder-icon" />
            <p>Select a template or start with a blank canvas</p>
          </div>
        </div>

        {/* Tutorial Overlay (if shown) */}
        {showTutorial && (
          <div className="tutorial-overlay">
            <div className="tutorial-content">
              <h2>Welcome to NaviBuild!</h2>
              <p>Let's get you started with the basics...</p>
              {/* Tutorial steps would go here */}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties & AI Suggestions */}
      <div className="dashboard-sidebar right">
        <div className="properties-panel">
          <h3>Properties</h3>
          <div className="property-placeholder">
            Select an element to edit its properties
          </div>
        </div>

        <div className="ai-suggestions-panel">
          <h3>AI Suggestions</h3>
          <div className="suggestion-card">
            <SparklesIcon className="suggestion-icon" />
            <div className="suggestion-content">
              <h4>Layout Balance</h4>
              <p>Consider adding a decorative element to the right corner for better visual balance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Management Panel */}
      <div className="projects-panel">
        <div className="panel-header">
          <h3>My Projects</h3>
          <button className="new-project-button">
            <FolderIcon className="button-icon" />
            New Project
          </button>
        </div>
        <div className="project-list">
          <div className="project-card active">
            <h4>Living Room Design</h4>
            <span className="project-date">Last edited: 2 hours ago</span>
          </div>
          <div className="project-card">
            <h4>Kitchen Renovation</h4>
            <span className="project-date">Last edited: Yesterday</span>
          </div>
          <div className="project-card">
            <h4>Master Bedroom</h4>
            <span className="project-date">Last edited: 3 days ago</span>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <button 
        className="help-button"
        onClick={() => setShowTutorial(true)}
      >
        <AcademicCapIcon className="help-icon" />
        Show Tutorial
      </button>
    </div>
  );
};

export default Dashboard; 