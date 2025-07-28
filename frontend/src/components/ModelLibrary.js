import React, { useState, useEffect } from 'react';
import './css/ModelLibrary.css';

const ModelLibrary = ({ onModelSelect }) => {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    style: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch models when filters change
  useEffect(() => {
    fetchModels();
  }, [filters, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/models/categories');
      const data = await response.json();
      if (data.status === 'success') {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/models?${queryParams}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // Combine components and roomTemplates into a single models array
        const combinedModels = [
          ...(data.data.components || []),
          ...(data.data.roomTemplates || [])
        ];
        console.log('ModelLibrary - Combined models:', combinedModels);
        console.log('ModelLibrary - First model _id:', combinedModels[0]?._id);
        
        // Debug thumbnail data
        console.log('ModelLibrary - Thumbnail debug:');
        combinedModels.forEach((model, index) => {
          console.log(`Model ${index + 1}: ${model.name}`);
          console.log(`  - Has thumbnail: ${!!model.thumbnail}`);
          console.log(`  - Thumbnail length: ${model.thumbnail ? model.thumbnail.length : 0}`);
          console.log(`  - Has old thumbnails: ${!!(model.thumbnails && model.thumbnails[0])}`);
        });
        
        setModels(combinedModels);
        setPagination(data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: combinedModels.length
        });
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleModelSelect = (model) => {
    console.log('ModelLibrary - Selected model:', model);
    console.log('ModelLibrary - Model has _id:', !!model._id);
    if (onModelSelect) {
      onModelSelect(model);
    }
  };

  const formatCategory = (category) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="model-library">
      <div className="library-header">
        <h2>3D Model Library</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search models..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Style:</label>
          <select
            value={filters.style}
            onChange={(e) => handleFilterChange('style', e.target.value)}
          >
            <option value="">All Styles</option>
            <option value="modern">Modern</option>
            <option value="traditional">Traditional</option>
            <option value="contemporary">Contemporary</option>
            <option value="minimalist">Minimalist</option>
            <option value="rustic">Rustic</option>
            <option value="industrial">Industrial</option>
            <option value="scandinavian">Scandinavian</option>
            <option value="vintage">Vintage</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading models...</div>
      ) : (
        <>
          <div className="models-grid">
            {models.map(model => (
              <div
                key={model._id}
                className="model-card"
                onClick={() => handleModelSelect(model)}
              >
                <div className="model-thumbnail">
                  {model.thumbnail ? (
                    <img
                      src={model.thumbnail}
                      alt={model.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-model.png';
                      }}
                    />
                  ) : model.thumbnails && model.thumbnails[0] ? (
                    <img
                      src={model.thumbnails[0].url}
                      alt={model.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-model.png';
                      }}
                    />
                  ) : (
                    <div className="no-image">
                      <span>📦</span>
                    </div>
                  )}
                </div>
                
                <div className="model-info">
                  <h3 className="model-name">{model.name}</h3>
                  <p className="model-description">{model.description}</p>
                  
                  <div className="model-details">
                    <span className="category">
                      {formatCategory(model.category)}
                    </span>
                    <span className="style">{model.style}</span>
                  </div>
                  
                  <div className="model-dimensions">
                    {model.dimensions.width}m × {model.dimensions.height}m × {model.dimensions.depth}m
                  </div>
                  
                  <div className="model-tags">
                    {model.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {models.length === 0 && (
            <div className="no-models">
              <p>No models found matching your criteria.</p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModelLibrary;
