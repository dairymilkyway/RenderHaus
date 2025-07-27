import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentDuplicateIcon,
  ArrowPathIcon,
  FolderIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import Properties from './Properties';
import Canvas from './Canvas';
import ProjectManager from './ProjectManager';
import './css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState('New Canvas');
  const [showTutorial, setShowTutorial] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [placedModels, setPlacedModels] = useState([]);
  const [isPlacedModelsMinimized, setIsPlacedModelsMinimized] = useState(false);
  const [modelScales, setModelScales] = useState({
    furniture: 0.08,
    roomTemplate: 0.8
  });
  
  // Project management state
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

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

  const handleTemplateSelect = useCallback((template) => {
    setSelectedTemplate(template);
  }, []);

  const handleModelSelect = useCallback((model) => {
    console.log('Dashboard - handleModelSelect received:', model);
    if (model) {
      console.log('Dashboard - Model has _id:', !!model._id, model._id);
    }
    if (!model) {
      setSelectedModel(null);
      return;
    }
    
    // Ensure the model has all required properties with defaults
    const modelWithDefaults = {
      ...model,
      // Map the correct URL field for the Canvas component
      url: model.url || model.fileUrl || (model.modelFile && model.modelFile.url),
      position: model.position || [0, 0.6, 0],
      scale: model.scale || [0.1, 0.1, 0.1],
      rotation: model.rotation || [0, 0, 0]
    };
    console.log('Dashboard - modelWithDefaults:', modelWithDefaults);
    setSelectedModel(modelWithDefaults);
  }, []);

  const handleAddModel = useCallback((model) => {
    console.log('Dashboard - handleAddModel called with:', model);
    if (model) {
      console.log('Dashboard - Model _id before processing:', model._id);
    }
    
    // Ensure model has required database fields
    const modelWithId = {
      ...model,
      id: model.id || Date.now() + Math.random(), // Local instance ID
      _id: model._id, // Database ID (should come from ModelLibrary)
      // Map the correct URL field for the Canvas component
      url: model.url || model.fileUrl || (model.modelFile && model.modelFile.url),
      position: model.position || [0, 0.6, 0],
      scale: model.scale || [0.1, 0.1, 0.1],
      rotation: model.rotation || [0, 0, 0]
    };
    
    console.log('Dashboard - Adding model to placedModels:', modelWithId);
    console.log('Dashboard - Final model _id:', modelWithId._id);
    setPlacedModels(prev => [...prev, modelWithId]);
    // Clear the selected template to prevent continuous adding
    setSelectedTemplate(null);
  }, []);

  const handleRemoveModel = useCallback((modelId) => {
    setPlacedModels(prev => prev.filter(model => model.id !== modelId));
    // If the removed model was selected, deselect it
    setSelectedModel(prev => prev?.id === modelId ? null : prev);
  }, []);

  const handleScaleChange = useCallback((scaleValue) => {
    if (selectedModel) {
      // Update only the selected model's scale
      const updatedModel = {
        ...selectedModel,
        scale: [scaleValue, scaleValue, scaleValue]
      };
      setSelectedModel(updatedModel);
      
      // Also update in the placed models list
      setPlacedModels(prev => 
        prev.map(model => 
          model.id === selectedModel.id ? updatedModel : model
        )
      );
    }
  }, [selectedModel]);

  const handleRotationChange = useCallback((rotationValue) => {
    if (selectedModel) {
      // Update only the selected model's rotation (Y-axis rotation in radians)
      const updatedModel = {
        ...selectedModel,
        rotation: [0, rotationValue, 0]
      };
      setSelectedModel(updatedModel);
      
      // Also update in the placed models list
      setPlacedModels(prev => 
        prev.map(model => 
          model.id === selectedModel.id ? updatedModel : model
        )
      );
    }
  }, [selectedModel]);

  const handlePositionUpdate = useCallback((axis, value) => {
    if (!selectedModel) return;
    
    const newPosition = [...selectedModel.position];
    if (axis === 'x') newPosition[0] = parseFloat(value);
    if (axis === 'z') newPosition[2] = parseFloat(value);
    
    setPlacedModels(prev => 
      prev.map(model => 
        model.id === selectedModel.id ? { ...model, position: newPosition } : model
      )
    );
    
    setSelectedModel(prev => ({ ...prev, position: newPosition }));
  }, [selectedModel]);

  // Project management functions
  const handleLoadProject = useCallback((project, loadedPlacedModels) => {
    setCurrentProject(project);
    setActiveProject(project.name);
    setPlacedModels(loadedPlacedModels);
    setSelectedModel(null);
    console.log('Project loaded:', project.name, 'with', loadedPlacedModels.length, 'models');
  }, []);

  const handleNewProject = useCallback(() => {
    setCurrentProject(null);
    setActiveProject('New Canvas');
    setPlacedModels([]);
    setSelectedModel(null);
    setShowProjectManager(false);
    console.log('New project created');
  }, []);

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
                <button 
                  className="action-button"
                  onClick={() => setShowProjectManager(true)}
                  title="Manage Projects"
                >
                  <FolderIcon className="action-icon" />
                  Projects
                </button>
                <button 
                  className="action-button"
                  onClick={() => setShowProjectManager(true)}
                  disabled={placedModels.length === 0}
                  title="Save Canvas"
                >
                  <DocumentPlusIcon className="action-icon" />
                  Save
                </button>
                <button className="action-button">
                  <ArrowPathIcon className="action-icon" />
                  Auto-Save On
                </button>
                <button className="action-button">
                  <DocumentDuplicateIcon className="action-icon" />
                  Duplicate
                </button>
              </div>
              
              {/* Model Controls */}
              <div className="model-controls">
                {selectedModel ? (
                  <div className="horizontal-control-layout">
                    <div className="control-header">
                      <div className="model-info">
                        <span className="model-name">{selectedModel.name}</span>
                        <span className="model-type">{selectedModel.type === 'room' ? 'Room Template' : 'Component'}</span>
                      </div>
                    </div>
                    
                    <div className="horizontal-controls">
                      {/* Size Control */}
                      <div className="control-section">
                        <label>Size</label>
                        <div className="control-input">
                          <input
                            type="range"
                            min="0.01"
                            max={selectedModel.type === 'room' ? "2.0" : "0.5"}
                            step="0.01"
                            value={selectedModel.scale?.[0] || 0.1}
                            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                            className="compact-slider"
                          />
                          <span className="control-value">{((selectedModel.scale?.[0] || 0.1) * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Rotation Control */}
                      <div className="control-section">
                        <label>Rotation</label>
                        <div className="control-input">
                          <input
                            type="range"
                            min="0"
                            max={Math.PI * 2}
                            step="0.1"
                            value={selectedModel.rotation?.[1] || 0}
                            onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
                            className="compact-slider"
                          />
                          <span className="control-value">{selectedModel.rotation ? Math.round((selectedModel.rotation[1] * 180) / Math.PI) : 0}°</span>
                        </div>
                      </div>

                      {/* Position Controls */}
                      <div className="control-section">
                        <label>Position</label>
                        <div className="position-controls-horizontal">
                          <div className="pos-control-inline">
                            <span>X:</span>
                            <input
                              type="range"
                              min="-2.5"
                              max="2.5"
                              step="0.1"
                              value={selectedModel.position?.[0] || 0}
                              onChange={(e) => handlePositionUpdate('x', e.target.value)}
                              className="compact-slider"
                            />
                            <span className="control-value">{(selectedModel.position?.[0] || 0).toFixed(1)}</span>
                          </div>
                          <div className="pos-control-inline">
                            <span>Z:</span>
                            <input
                              type="range"
                              min="-2"
                              max="2"
                              step="0.1"
                              value={selectedModel.position?.[2] || 0}
                              onChange={(e) => handlePositionUpdate('z', e.target.value)}
                              className="compact-slider"
                            />
                            <span className="control-value">{(selectedModel.position?.[2] || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <button 
                          className="center-btn"
                          onClick={() => {
                            const newPos = [0, 0.6, 0];
                            setPlacedModels(prev => 
                              prev.map(model => 
                                model.id === selectedModel.id ? { ...model, position: newPos } : model
                              )
                            );
                            setSelectedModel(prev => ({ ...prev, position: newPos }));
                          }}
                        >
                          Center
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="control-placeholder">
                    <span>Select a model from the list to adjust its properties</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Design Canvas Area */}
        <Canvas 
          selectedTemplate={selectedTemplate} 
          modelScales={modelScales}
          selectedModel={selectedModel}
          onModelSelect={handleModelSelect}
          onAddModel={handleAddModel}
          placedModels={placedModels}
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

      {/* Middle Panel - Placed Models List */}
      <div className={`placed-models-panel ${isPlacedModelsMinimized ? 'minimized' : ''}`}>
        <div className="panel-header">
          <h3>Placed Models</h3>
          <div className="panel-controls">
            <span className="model-count">{placedModels.length} items</span>
            <button 
              className="minimize-button"
              onClick={() => setIsPlacedModelsMinimized(!isPlacedModelsMinimized)}
              title={isPlacedModelsMinimized ? 'Maximize panel' : 'Minimize panel'}
            >
              {isPlacedModelsMinimized ? '□' : '−'}
            </button>
          </div>
        </div>
        
        {!isPlacedModelsMinimized && (
          <div className="models-list">
            {placedModels.length === 0 ? (
              <div className="empty-list">
                <p>No models placed yet</p>
                <span>Add models from the library →</span>
              </div>
            ) : (
              placedModels.map((model) => (
                <div
                  key={model.id}
                  className={`model-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="model-info">
                    <div className="model-name">{model.name}</div>
                    <div className="model-type">
                      {model.type === 'room' ? 'Room Template' : 'Component'}
                    </div>
                    <div className="model-properties">
                      <span className="model-scale">
                        Scale: {(((model.scale && model.scale[0]) || 0.1) * 100).toFixed(0)}%
                      </span>
                      <span className="model-rotation">
                        Rotation: {model.rotation && model.rotation[1] ? Math.round((model.rotation[1] * 180) / Math.PI) : 0}°
                      </span>
                      <span className="model-position">
                        Pos: ({((model.position && model.position[0]) || 0).toFixed(1)}, {((model.position && model.position[2]) || 0).toFixed(1)})
                      </span>
                    </div>
                  </div>
                  <button
                    className="remove-model-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveModel(model.id);
                  }}
                  title="Remove model"
                >
                  ×
                </button>
              </div>
            ))
          )}
          </div>
        )}
      </div>

      {/* Right Sidebar - Properties */}
      <Properties 
        activeSection={activeSection} 
        onTemplateSelect={handleTemplateSelect}
        placedModels={placedModels}
        onModelSelect={handleModelSelect}
      />

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          user={user}
          onLoadProject={handleLoadProject}
          onNewProject={handleNewProject}
          currentProject={currentProject}
          placedModels={placedModels}
          isVisible={showProjectManager}
          onClose={() => setShowProjectManager(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 