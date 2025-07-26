import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import Properties from './Properties';
import Canvas from './Canvas';
import './css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeProject] = useState('Living Room Design');
  const [showTutorial, setShowTutorial] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modelScales, setModelScales] = useState({
    furniture: 0.08,
    roomTemplate: 0.8
  });

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      return data.data.tokens.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
      throw error;
    }
  }, [navigate]);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const newToken = await refreshToken();
        return fetchUserProfile(newToken);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.data.user);
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.message !== 'Token refresh failed') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, refreshToken, setUser, setLoading]);

  useEffect(() => {
    const initializeProfile = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      await fetchUserProfile(accessToken);
    };

    initializeProfile();

    // Set up periodic token refresh (every 45 minutes)
    const refreshInterval = setInterval(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        refreshToken().catch(console.error);
      }
    }, 45 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [navigate, fetchUserProfile, refreshToken]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />

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
              
              {/* Size Adjuster Controls */}
              <div className="size-controls">
                <div className="size-control-group">
                  <label>Furniture Size:</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={modelScales.furniture}
                    onChange={(e) => setModelScales({
                      ...modelScales,
                      furniture: parseFloat(e.target.value)
                    })}
                    className="size-slider"
                  />
                  <span className="size-value">{(modelScales.furniture * 100).toFixed(0)}%</span>
                </div>
                <div className="size-control-group">
                  <label>Room Template Size:</label>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.1"
                    value={modelScales.roomTemplate}
                    onChange={(e) => setModelScales({
                      ...modelScales,
                      roomTemplate: parseFloat(e.target.value)
                    })}
                    className="size-slider"
                  />
                  <span className="size-value">{(modelScales.roomTemplate * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Canvas Area */}
        <Canvas 
          selectedTemplate={selectedTemplate} 
          modelScales={modelScales}
        />

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
      <Properties 
        activeSection={activeSection} 
        onTemplateSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default Dashboard; 