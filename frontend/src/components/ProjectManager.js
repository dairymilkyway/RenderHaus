import React, { useState, useEffect } from 'react';
import { 
  DocumentDuplicateIcon, 
  TrashIcon, 
  FolderOpenIcon,
  CalendarIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import MiniCanvas from './MiniCanvas';
import './css/ProjectManager.css';

const ProjectManager = ({ 
  user, 
  onLoadProject, 
  onNewProject, 
  currentProject, 
  placedModels,
  isVisible,
  onClose 
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    if (isVisible && user) {
      fetchProjects();
    }
  }, [isVisible, user]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data);
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentProject = async (name, description, isNew = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Ensure placedModels have all required fields
      const validatedPlacedModels = placedModels.map(model => ({
        _id: model._id,
        id: model.id || `model_${Date.now()}_${Math.random()}`,
        name: model.name || 'Unnamed Model',
        category: model.category || 'furniture',
        fileUrl: model.fileUrl,
        modelFile: model.modelFile,
        position: Array.isArray(model.position) ? {
          x: model.position[0] || 0,
          y: model.position[1] || 0,
          z: model.position[2] || 0
        } : (model.position || { x: 0, y: 0, z: 0 }),
        rotation: Array.isArray(model.rotation) ? {
          x: model.rotation[0] || 0,
          y: model.rotation[1] || 0,
          z: model.rotation[2] || 0
        } : (model.rotation || { x: 0, y: 0, z: 0 }),
        scale: Array.isArray(model.scale) ? {
          x: model.scale[0] || 1,
          y: model.scale[1] || 1,
          z: model.scale[2] || 1
        } : (typeof model.scale === 'number' ? {
          x: model.scale,
          y: model.scale,
          z: model.scale
        } : (model.scale || { x: 1, y: 1, z: 1 })),
        customMaterial: model.customMaterial || {}
      }));

      const projectData = {
        name: name || `Project ${new Date().toLocaleString()}`,
        description: description || '',
        placedModels: validatedPlacedModels,
        type: 'interior',
        dimensions: { width: 20, height: 10, depth: 20 },
        camera: { position: { x: 5, y: 5, z: 5 }, target: { x: 0, y: 0, z: 0 } },
        environment: { 
          lighting: 'natural', 
          backgroundColor: '#f0f0f0', 
          ambientColor: '#404040' 
        }
      };

      console.log('Saving project with data:', JSON.stringify(projectData, null, 2));

      let response;
      if (isNew || !currentProject?._id) {
        response = await fetch('http://localhost:5000/api/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });
      } else {
        response = await fetch(`http://localhost:5000/api/projects/${currentProject._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(projectData)
        });
      }

      if (response.ok) {
        const data = await response.json();
        await fetchProjects();
        setShowNewProjectDialog(false);
        setNewProjectName('');
        setNewProjectDescription('');
        return data.data;
      } else {
        throw new Error('Failed to save project');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error saving project:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async (project) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/projects/${project._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const loadedProject = data.data;
        
        // Debug: Log the loaded project structure
        console.log('=== FRONTEND PROJECT LOADING DEBUG ===');
        console.log('Raw project data:', loadedProject);
        console.log('Project objects count:', loadedProject.objects.length);
        console.log('Loaded project objects:', loadedProject.objects.map((obj, index) => ({
          index,
          instanceId: obj.instanceId,
          modelId: obj.modelId,
          modelType: obj.modelType,
          isPopulated: obj.modelId !== null && typeof obj.modelId === 'object',
          hasId: obj.modelId && obj.modelId._id ? true : false,
          modelName: obj.modelId && obj.modelId.name ? obj.modelId.name : 'null/undefined'
        })));
        console.log('=== END FRONTEND DEBUG ===');
        
        // Check for objects with null modelId
        const nullModels = loadedProject.objects.filter(obj => obj.modelId === null || obj.modelId === undefined);
        if (nullModels.length > 0) {
          console.warn(`Project contains ${nullModels.length} models that no longer exist in the database. These will be skipped.`);
        }
        
        // Convert project objects back to placed models format
        // Filter out objects with null modelId (deleted models)
        const placedModels = loadedProject.objects
          .filter(obj => obj.modelId !== null && obj.modelId !== undefined && obj.modelId._id)
          .map(obj => {
            // Additional safety check
            if (!obj.modelId || !obj.modelId._id) {
              console.warn('Skipping object with invalid modelId:', obj);
              return null;
            }
            
            return {
              id: obj.instanceId,
              _id: obj.modelId._id,
              name: obj.modelId.name || 'Unknown Model',
              category: obj.modelId.category || 'uncategorized',
              fileUrl: obj.modelId.fileUrl,
              modelFile: obj.modelId.modelFile,
              // Map the correct URL field for the Canvas component
              url: obj.modelId.fileUrl || (obj.modelId.modelFile && obj.modelId.modelFile.url),
              // Convert object format {x, y, z} to array format [x, y, z]
              position: obj.position ? [obj.position.x || 0, obj.position.y || 0, obj.position.z || 0] : [0, 0.6, 0],
              rotation: obj.rotation ? [obj.rotation.x || 0, obj.rotation.y || 0, obj.rotation.z || 0] : [0, 0, 0],
              scale: obj.scale ? [obj.scale.x || 1, obj.scale.y || 1, obj.scale.z || 1] : [0.1, 0.1, 0.1],
              customMaterial: obj.customMaterial || {}
            };
          })
          .filter(model => model !== null); // Remove any null results from the map

        onLoadProject(loadedProject, placedModels);
        onClose();
      } else {
        throw new Error('Failed to load project');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting project:', err);
    } finally {
      setLoading(false);
    }
  };

  const duplicateProject = async (project) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/projects/${project._id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchProjects();
      } else {
        throw new Error('Failed to duplicate project');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error duplicating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNew = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }
    await saveCurrentProject(newProjectName, newProjectDescription, true);
  };

  if (!isVisible) return null;

  return (
    <div className="project-manager-overlay">
      <div className="project-manager">
        <div className="project-manager-header">
          <h2>Project Manager</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="project-actions">
          <button 
            className="action-button primary"
            onClick={() => setShowNewProjectDialog(true)}
            disabled={loading}
          >
            Save as New Project
          </button>
          <button 
            className="action-button tertiary"
            onClick={onNewProject}
          >
            New Canvas
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="projects-list">
          <h3>Your Projects ({projects.length})</h3>
          
          {loading && (
            <div className="loading-state">
              <p>Loading projects...</p>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="empty-state">
              <FolderOpenIcon className="empty-icon" />
              <p>No projects saved yet</p>
              <p>Create your first project by placing some models and saving!</p>
            </div>
          )}

          <div className="projects-grid">
            {projects.map(project => (
              <div key={project._id} className="project-card">
                {/* Project Preview - Mini 3D Canvas */}
                <div className="project-preview">
                  <MiniCanvas 
                    project={project}
                    width={280}
                    height={180}
                    className="project-mini-canvas"
                  />
                  {project.objects?.length === 0 && (
                    <div className="preview-placeholder empty-project">
                      <PhotoIcon className="preview-icon" />
                      <span>Empty Project</span>
                      <small>No models added</small>
                    </div>
                  )}
                </div>

                <div className="project-content">
                  <div className="project-header">
                    <h4 className="project-name">{project.name}</h4>
                    <span className="project-status">{project.status}</span>
                  </div>
                  
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}

                  <div className="project-meta">
                    <div className="meta-item">
                      <CalendarIcon className="meta-icon" />
                      <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <EyeIcon className="meta-icon" />
                      <span>{project.objects.length} items</span>
                    </div>
                  </div>

                  <div className="project-actions">
                    <button 
                      className="action-btn load"
                      onClick={() => loadProject(project)}
                      disabled={loading}
                      title="Load Project"
                    >
                      <FolderOpenIcon />
                    </button>
                    <button 
                      className="action-btn duplicate"
                      onClick={() => duplicateProject(project)}
                      disabled={loading}
                      title="Duplicate Project"
                    >
                      <DocumentDuplicateIcon />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => deleteProject(project._id)}
                      disabled={loading}
                      title="Delete Project"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showNewProjectDialog && (
          <div className="dialog-overlay">
            <div className="dialog">
              <h3>Save New Project</h3>
              <div className="form-group">
                <label>Project Name*</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your project"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="dialog-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setShowNewProjectDialog(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleSaveNew}
                  disabled={loading || !newProjectName.trim()}
                >
                  {loading ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManager;
