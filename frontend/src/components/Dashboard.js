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
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import './css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeProject] = useState('Living Room Design');
  const [showTutorial, setShowTutorial] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data.data.user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

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
              <h2>Welcome to RenderHaus!</h2>
              <p>Let's get you started with the basics...</p>
              {/* Tutorial steps would go here */}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties */}
      <div className="dashboard-sidebar right">
        <div className="properties-panel">
          <h3>Properties</h3>
          <div className="property-placeholder">
            Select an element to view its properties
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 