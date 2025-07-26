import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import './css/ModelManagement.css';

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    category: 'room template',
    style: 'modern',
    tags: '',
    materials: '',
    file: null,
    roomType: 'living-room', // For room templates
    subcategory: 'furniture' // For components
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'room template', label: 'Room Templates' },
    { value: 'components', label: 'Components' }
  ];

  const subcategories = {
    'room template': ['living-room', 'bedroom', 'kitchen', 'bathroom', 'dining-room', 'home-office', 'guest-room', 'walk-in-closet', 'laundry-room', 'garage', 'basement', 'attic'],
    'components': ['furniture', 'furniture-seating', 'furniture-tables', 'furniture-storage', 'furniture-beds', 'lighting', 'appliances', 'decorative', 'plants', 'architectural-doors', 'architectural-windows', 'architectural-stairs', 'flooring', 'walls', 'ceilings', 'exterior-landscaping', 'exterior-structures']
  };

  const styles = ['modern', 'traditional', 'minimalist', 'industrial', 'rustic', 'contemporary'];

  // Fetch models from API
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching models with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('/api/models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Models fetch response status:', response.status);
      
      const result = await response.json();
      if (result.status === 'success') {
        // Combine components and room templates into a single array for display
        const allModels = [
          ...(result.data.components || []).map(model => ({ ...model, type: 'component' })),
          ...(result.data.roomTemplates || []).map(room => ({ ...room, type: 'room' }))
        ];
        setModels(allModels);
        console.log('Models loaded successfully:', allModels.length, 'total items');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.gltf', '.glb', '.obj', '.fbx', '.dae', '.3ds'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Invalid file type. Please select a 3D model file (.gltf, .glb, .obj, .fbx, .dae, .3ds)');
        return;
      }
      
      if (file.size > 250 * 1024 * 1024) { // 250MB limit
        alert('File size must be less than 250MB');
        return;
      }
      
      setUploadData({ ...uploadData, file });
    }
  };

  // Upload new model
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      alert('Please select a file to upload');
      return;
    }

    // Check file size (100MB limit for Uploadcare free tier)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (uploadData.file.size > maxSize) {
      alert(`File is too large. Maximum size allowed is 100MB (your file is ${Math.round(uploadData.file.size / (1024 * 1024))}MB). Please try with a smaller file or consider upgrading your Uploadcare plan.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('modelFile', uploadData.file);
    formData.append('name', uploadData.name);
    formData.append('description', uploadData.description);
    formData.append('category', uploadData.category);
    formData.append('style', uploadData.style);
    formData.append('tags', uploadData.tags);
    formData.append('materials', uploadData.materials);
    
    // Add roomType for room templates or subcategory for components
    if (uploadData.category === 'room template') {
      formData.append('roomType', uploadData.roomType);
    } else if (uploadData.category === 'components') {
      formData.append('subcategory', uploadData.subcategory || 'furniture');
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }
      
      console.log('Starting upload with token:', token ? 'Token exists' : 'No token');
      console.log('File size:', uploadData.file.size, 'bytes');
      console.log('File type:', uploadData.file.type);
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          console.log('Upload progress:', percentComplete + '%');
        }
      });

      // Set up the request
      xhr.open('POST', '/api/models/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      console.log('Request configured, sending to:', '/api/models/upload');
      
      // Handle the response
      xhr.onload = function() {
        setIsUploading(false);
        setUploadProgress(0);
        
        console.log('Upload completed with status:', xhr.status);
        console.log('Response text:', xhr.responseText);
        
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.status === 'success') {
              alert('Model uploaded successfully!');
              setShowUploadModal(false);
              setUploadData({
                name: '',
                description: '',
                category: 'room template',
                style: 'modern',
                tags: '',
                materials: '',
                file: null,
                roomType: 'living-room',
                subcategory: 'furniture'
              });
              fetchModels(); // Refresh the list
            } else {
              alert(`Upload failed: ${result.message}`);
            }
          } catch (parseError) {
            console.error('Response parsing error:', parseError);
            console.error('Raw response:', xhr.responseText);
            alert('Upload failed: Invalid server response');
          }
        } else {
          console.error('Upload failed with status:', xhr.status);
          console.error('Response:', xhr.responseText);
          
          // Handle specific error codes
          if (xhr.status === 413) {
            alert('Upload failed: File is too large. Uploadcare free tier supports files up to 100MB. Please try with a smaller file or consider upgrading your Uploadcare plan.');
            return;
          }
          
          if (xhr.status === 408) {
            alert('Upload failed: Upload timeout. The file may be too large or the connection is slow. Please try with a smaller file.');
            return;
          }
          
          // Try to parse error message from response
          try {
            const errorResult = JSON.parse(xhr.responseText);
            alert(`Upload failed: ${errorResult.message || 'Server error'}`);
          } catch (parseError) {
            alert(`Upload failed: Server returned status ${xhr.status}. Check console for details.`);
          }
        }
      };

      // Handle network errors
      xhr.onerror = function() {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('XMLHttpRequest error event triggered');
        console.error('Ready state:', xhr.readyState);
        console.error('Status:', xhr.status);
        console.error('Response text:', xhr.responseText);
        alert('Upload failed: Network error. Please check if the backend server is running and try again.');
      };

      // Handle timeout
      xhr.ontimeout = function() {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Upload timeout');
        alert('Upload failed: Request timed out. Please try with a smaller file or check your connection.');
      };

      // Set timeout to 10 minutes for large files
      xhr.timeout = 10 * 60 * 1000; // 10 minutes

      // Send the request
      xhr.send(formData);
      
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    }
  };

  // Delete model
  const handleDelete = async (modelId) => {
    if (!window.confirm('Are you sure you want to delete this model?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        alert('Model deleted successfully!');
        fetchModels(); // Refresh the list
      } else {
        alert(`Delete failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  // Test connection to backend
  const testConnection = async () => {
    try {
      console.log('Testing connection to backend...');
      const response = await fetch('/api/models');
      console.log('Connection test response:', response.status);
      
      if (response.ok) {
        alert('✅ Backend connection successful!');
      } else {
        alert(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('❌ Cannot connect to backend. Make sure the server is running on port 5000.');
    }
  };

  // Filter models
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (model.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // For filtering, map the model's properties to the category structure
    let modelCategory;
    if (model.type === 'room') {
      modelCategory = 'room template';
    } else if (model.type === 'component') {
      modelCategory = 'components';
    } else {
      // Fallback for existing models
      modelCategory = model.category;
    }
    
    const matchesCategory = filterCategory === 'all' || modelCategory === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="model-management">
        <div className="loading">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="model-management">
      <div className="model-management-header">
        <h1>3D Model Management</h1>
        <div className="header-buttons">
          <button 
            className="btn-secondary"
            onClick={testConnection}
            style={{ marginRight: '1rem' }}
          >
            Test Connection
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <PlusIcon className="icon" />
            Upload New Model
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="model-controls">
        <div className="search-box">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-box">
          <FunnelIcon className="filter-icon" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Models Grid */}
      <div className="models-grid">
        {filteredModels.length === 0 ? (
          <div className="no-models">
            <CubeIcon className="no-models-icon" />
            <p>No models found</p>
          </div>
        ) : (
          filteredModels.map(model => (
            <div key={model._id} className="model-card">
              <div className="model-preview">
                {model.previewImage ? (
                  <img src={model.previewImage} alt={model.name} />
                ) : (
                  <div className="model-placeholder">
                    <CubeIcon className="placeholder-icon" />
                  </div>
                )}
              </div>
              
              <div className="model-info">
                <h3>{model.name}</h3>
                <p className="model-description">{model.description}</p>
                
                <div className="model-meta">
                  <span className="model-category">
                    {model.type === 'room' ? 'Room Template' : 'Component'}
                  </span>
                  <span className="model-style">{model.style}</span>
                </div>
                
                <div className="model-tags">
                  {model.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                
                <div className="model-stats">
                  <span>Format: {model.fileFormat?.toUpperCase()}</span>
                  <span>Size: {(model.fileSize / (1024 * 1024)).toFixed(1)}MB</span>
                </div>
              </div>
              
              <div className="model-actions">
                <button 
                  className="btn-icon"
                  onClick={() => window.open(model.fileUrl, '_blank')}
                  title="View Model"
                >
                  <EyeIcon className="icon" />
                </button>
                <button 
                  className="btn-icon"
                  onClick={() => {
                    setSelectedModel(model);
                    setShowEditModal(true);
                  }}
                  title="Edit Model"
                >
                  <PencilIcon className="icon" />
                </button>
                <button 
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(model._id)}
                  title="Delete Model"
                >
                  <TrashIcon className="icon" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Upload New 3D Model</h2>
              <button 
                className="modal-close"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Model File *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".gltf,.glb,.obj,.fbx,.dae,.3ds"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="file-upload-info">
                    <CloudArrowUpIcon className="upload-icon" />
                    <p>Select 3D model file (.gltf, .glb, .obj, .fbx, .dae, .3ds)</p>
                    <p>Maximum file size: 250MB</p>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Model Name</label>
                  <input
                    type="text"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                    placeholder="Enter model name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setUploadData({
                        ...uploadData, 
                        category: newCategory,
                        roomType: newCategory === 'room template' ? 'living-room' : uploadData.roomType,
                        subcategory: newCategory === 'components' ? 'furniture' : uploadData.subcategory
                      });
                    }}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                {uploadData.category === 'room template' && (
                  <div className="form-group">
                    <label>Room Type</label>
                    <select
                      value={uploadData.roomType}
                      onChange={(e) => setUploadData({...uploadData, roomType: e.target.value})}
                    >
                      {subcategories['room template']?.map(roomType => (
                        <option key={roomType} value={roomType}>
                          {roomType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {uploadData.category === 'components' && (
                  <div className="form-group">
                    <label>Component Type</label>
                    <select
                      value={uploadData.subcategory}
                      onChange={(e) => setUploadData({...uploadData, subcategory: e.target.value})}
                    >
                      {subcategories['components']?.map(subcategory => (
                        <option key={subcategory} value={subcategory}>
                          {subcategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group">
                  <label>Style</label>
                  <select
                    value={uploadData.style}
                    onChange={(e) => setUploadData({...uploadData, style: e.target.value})}
                  >
                    {styles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Enter model description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                    placeholder="modern, comfortable, living room"
                  />
                </div>
                
                <div className="form-group">
                  <label>Materials (comma-separated)</label>
                  <input
                    type="text"
                    value={uploadData.materials}
                    onChange={(e) => setUploadData({...uploadData, materials: e.target.value})}
                    placeholder="wood, metal, fabric"
                  />
                </div>
              </div>

              <div className="modal-actions">
                {isUploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p>Uploading... {uploadProgress}%</p>
                  </div>
                )}
                <div className="action-buttons">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isUploading}
                  >
                    <CloudArrowUpIcon className="icon" />
                    {isUploading ? 'Uploading...' : 'Upload Model'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelManagement;
