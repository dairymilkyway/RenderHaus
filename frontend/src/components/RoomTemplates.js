import React, { useState, useEffect } from 'react';
import './css/RoomTemplates.css';

const RoomTemplates = ({ onRoomSelect, onTemplateSelect }) => {
  const [rooms, setRooms] = useState([]);
  const [houseTemplates, setHouseTemplates] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'templates'
  const [filters, setFilters] = useState({
    type: '',
    style: '',
    bedrooms: '',
    category: ''
  });

  useEffect(() => {
    fetchRoomTypes();
    fetchRooms();
    fetchHouseTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchRooms();
    } else {
      fetchHouseTemplates();
    }
  }, [filters, activeTab]);

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('/api/design/rooms/types');
      const data = await response.json();
      if (data.status === 'success') {
        setRoomTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.style) queryParams.append('style', filters.style);

      const response = await fetch(`/api/design/rooms?${queryParams}`);
      const data = await response.json();
      if (data.status === 'success') {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseTemplates = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.style) queryParams.append('style', filters.style);

      const response = await fetch(`/api/design/templates?${queryParams}`);
      const data = await response.json();
      if (data.status === 'success') {
        setHouseTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching house templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatRoomType = (type) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const calculateRoomArea = (room) => {
    return (room.layout.width * room.layout.length).toFixed(1);
  };

  return (
    <div className="room-templates">
      <div className="templates-header">
        <h2>Design Templates</h2>
        <div className="tab-switcher">
          <button
            className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Room Templates
          </button>
          <button
            className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            House Templates
          </button>
        </div>
      </div>

      <div className="filters-section">
        {activeTab === 'rooms' ? (
          <>
            <div className="filter-group">
              <label>Room Type:</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>
                    {formatRoomType(type)}
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
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
                <option value="studio">Studio</option>
                <option value="loft">Loft</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Bedrooms:</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              >
                <option value="">Any</option>
                <option value="0">Studio</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>
          </>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        <div className="templates-grid">
          {activeTab === 'rooms' ? (
            rooms.map(room => (
              <div
                key={room._id}
                className="template-card room-card"
                onClick={() => onRoomSelect && onRoomSelect(room)}
              >
                <div className="template-thumbnail">
                  {room.thumbnail ? (
                    <img src={room.thumbnail} alt={room.name} />
                  ) : (
                    <div className="no-image">
                      <span>🏠</span>
                    </div>
                  )}
                </div>
                
                <div className="template-info">
                  <h3 className="template-name">{room.name}</h3>
                  <div className="template-details">
                    <span className="room-type">
                      {formatRoomType(room.type)}
                    </span>
                    <span className="room-area">
                      {calculateRoomArea(room)} m²
                    </span>
                  </div>
                  
                  <div className="dimensions">
                    {room.layout.width}m × {room.layout.length}m × {room.layout.height}m
                  </div>
                  
                  <div className="template-tags">
                    {room.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  {room.style && (
                    <div className="style-badge">{room.style}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            houseTemplates.map(template => (
              <div
                key={template._id}
                className="template-card house-card"
                onClick={() => onTemplateSelect && onTemplateSelect(template)}
              >
                <div className="template-thumbnail">
                  {template.thumbnail ? (
                    <img src={template.thumbnail} alt={template.name} />
                  ) : (
                    <div className="no-image">
                      <span>🏡</span>
                    </div>
                  )}
                </div>
                
                <div className="template-info">
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-specs">
                    <div className="spec">
                      <span className="spec-label">Bedrooms:</span>
                      <span className="spec-value">{template.specifications.bedrooms}</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">Bathrooms:</span>
                      <span className="spec-value">{template.specifications.bathrooms}</span>
                    </div>
                    <div className="spec">
                      <span className="spec-label">Area:</span>
                      <span className="spec-value">{template.specifications.totalArea} m²</span>
                    </div>
                  </div>
                  
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div className="template-badges">
                    <span className="category-badge">{template.category}</span>
                    <span className="price-badge">{template.priceRange}</span>
                  </div>

                  <div className="download-count">
                    Downloaded {template.downloadCount} times
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {((activeTab === 'rooms' && rooms.length === 0) || 
        (activeTab === 'templates' && houseTemplates.length === 0)) && !loading && (
        <div className="no-templates">
          <p>No {activeTab === 'rooms' ? 'room templates' : 'house templates'} found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default RoomTemplates;
