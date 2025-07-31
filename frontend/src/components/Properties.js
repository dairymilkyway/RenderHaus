import React, { useState, useEffect } from 'react';
// import TemplatesSection from './Functions/TemplatesSection';
// import ComponentsSection from './Functions/ComponentsSection';
// import MaterialsSection from './Functions/MaterialsSection';
// import ViewSection from './Functions/ViewSection';
import AISuggestSection from './Functions/AISuggestSection';
import ExportSection from './Functions/ExportSection';
import ObjectProperties from './Functions/ObjectProperties';
// import AIExplainSection from './Functions/AIExplainSection';
// import SaveExportSection from './Functions/SaveExportSection';
import './css/Properties.css';
import './Functions/css/Sections.css'; // Add the template styling

// Inline Templates Section with API integration and styling
const InlineTemplatesSection = ({ onTemplateSelect }) => {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState({ rooms: false, models: false });
  const [error, setError] = useState({ rooms: null, models: null });

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(prev => ({ ...prev, rooms: true }));
      try {
        const response = await fetch('http://localhost:5000/api/models?category=room template');
        const data = await response.json();
        if (data.status === 'success') {
          // Get room templates from the response
          const roomTemplatesData = data.data.roomTemplates || [];
          setRooms(roomTemplatesData);
        } else {
          throw new Error(data.message || 'Failed to fetch room templates');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(prev => ({ ...prev, rooms: err.message }));
        // Fallback to mock data
        setRooms([
          {
            _id: '1',
            name: 'Modern Living Room',
            type: 'living-room',
            style: 'modern',
            layout: { width: 5, length: 6, height: 2.7 },
            tags: ['spacious', 'bright']
          },
          {
            _id: '2', 
            name: 'Master Bedroom',
            type: 'bedroom',
            style: 'contemporary',
            layout: { width: 4, length: 5, height: 2.4 },
            tags: ['cozy', 'relaxing']
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, rooms: false }));
      }
    };

    fetchRooms();
  }, []);

  // Fetch models from API
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(prev => ({ ...prev, models: true }));
      try {
        const response = await fetch('http://localhost:5000/api/models?category=components');
        const data = await response.json();
        console.log('Components API response:', data); // Debug log
        if (data.status === 'success') {
          setModels(data.data.components || []);
        } else {
          throw new Error(data.message || 'Failed to fetch components');
        }
      } catch (err) {
        console.error('Error fetching models:', err);
        setError(prev => ({ ...prev, models: err.message }));
        // Fallback to mock data
        setModels([
          {
            _id: '1',
            name: 'Modern Sofa',
            category: 'furniture-seating',
            description: 'Contemporary 3-seater sofa',
            style: 'modern',
            tags: ['living room', 'seating']
          },
          {
            _id: '2',
            name: 'Coffee Table', 
            category: 'furniture-tables',
            description: 'Glass top coffee table',
            style: 'contemporary',
            tags: ['living room', 'modern']
          }
        ]);
      } finally {
        setLoading(prev => ({ ...prev, models: false }));
      }
    };

    fetchModels();
  }, []);

  const handleRoomSelect = (room) => {
    console.log('Room selected:', room);
    if (onTemplateSelect) {
      onTemplateSelect({
        type: 'room',
        ...room, // Spread room properties directly to template
        data: room // Keep data property for backwards compatibility
      });
    }
  };

  const handleModelSelect = (model) => {
    console.log('3D Model selected:', model);
    if (onTemplateSelect) {
      onTemplateSelect({
        type: 'model',
        ...model, // Spread model properties directly to template
        data: model // Keep data property for backwards compatibility
      });
    }
  };

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h3>Design Templates</h3>
        <div className="template-tabs">
          <button
            className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Room Templates
          </button>
          <button
            className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            3D Models
          </button>
        </div>
      </div>

      <div className="template-content">
        {activeTab === 'rooms' && (
          <div>
            {loading.rooms && <p>Loading room templates...</p>}
            {error.rooms && <p style={{ color: '#ef4444' }}>Error: {error.rooms}</p>}
            {!loading.rooms && rooms.length === 0 && <p>No room templates found.</p>}
            <div className="templates-grid">
              {rooms.map(room => (
                <div
                  key={room._id}
                  className="template-card"
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="template-preview">
                    <div className="preview-image">
                      {room.thumbnail || room.modelFile?.url ? (
                        <img src={room.thumbnail || room.modelFile.url} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        '🏠'
                      )}
                    </div>
                  </div>
                  <div className="template-info">
                    <h4>{room.name}</h4>
                    <p>{room.layout?.width}m × {room.layout?.length}m</p>
                    <div className="template-tags">
                      {room.tags?.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'models' && (
          <div>
            {loading.models && <p>Loading 3D models...</p>}
            {error.models && <p style={{ color: '#ef4444' }}>Error: {error.models}</p>}
            <div className="templates-grid">
              {models.map(model => (
                <div
                  key={model._id}
                  className="template-card"
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="template-preview">
                    <div className="preview-image">
                      {model.thumbnail || model.fileUrl || model.modelFile?.url ? (
                        <img src={model.thumbnail || model.fileUrl || model.modelFile.url} alt={model.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        '📦'
                      )}
                    </div>
                  </div>
                  <div className="template-info">
                    <h4>{model.name}</h4>
                    <p>{model.description}</p>
                    <div className="template-tags">
                      {model.tags?.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Properties = ({ 
  activeSection, 
  onTemplateSelect, 
  placedModels, 
  onModelSelect,
  selectedObject,
  onColorChange,
  onAIColorSuggestion,
  onColorReset,
  onObjectTransform,
  onObjectDelete
}) => {
  const renderSection = () => {
    switch (activeSection) {
      case 'templates':
        return <InlineTemplatesSection onTemplateSelect={onTemplateSelect} />;
      case 'object-properties':
        return (
          <ObjectProperties
            selectedObject={selectedObject}
            onColorChange={onColorChange}
            onAIColorSuggestion={onAIColorSuggestion}
            onColorReset={onColorReset}
            onObjectDelete={onObjectDelete}
          />
        );
      case 'components':
        return <div className="properties-panel"><h3>Components</h3><p>Component selection coming soon...</p></div>;
      case 'materials':
        return <div className="properties-panel"><h3>Materials</h3><p>Material selection coming soon...</p></div>;
      case 'view':
        return <div className="properties-panel"><h3>View</h3><p>View options coming soon...</p></div>;
      case 'ai-suggestions':
        return <AISuggestSection placedModels={placedModels} onModelSelect={onModelSelect} />;
      case 'ai-explain':
        return <div className="properties-panel"><h3>AI Explain</h3><p>AI explanations coming soon...</p></div>;
      case 'save-export':
        return <ExportSection placedModels={placedModels} />;
      default:
        return (
          <div className="properties-panel">
            <h3>Properties</h3>
            <div className="property-placeholder">
              Select a tool from the sidebar to view options
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-sidebar right">
      {renderSection()}
    </div>
  );
};

export default Properties; 