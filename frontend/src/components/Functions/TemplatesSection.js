import React, { useState } from 'react';

const mockRooms = [
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
];

const mockModels = [
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
];

function TemplatesSection({ onTemplateSelect }) {
  const [activeTab, setActiveTab] = useState('rooms');

  const handleRoomSelect = (room) => {
    console.log('Room selected:', room);
    if (onTemplateSelect) {
      onTemplateSelect({
        type: 'room',
        data: room
      });
    }
  };

  const handleModelSelect = (model) => {
    console.log('3D Model selected:', model);
    if (onTemplateSelect) {
      onTemplateSelect({
        type: 'model',
        data: model
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3>Design Templates</h3>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            style={{
              padding: '8px 16px',
              background: activeTab === 'rooms' ? '#3b82f6' : '#f1f5f9',
              color: activeTab === 'rooms' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('rooms')}
          >
            Room Templates
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: activeTab === 'models' ? '#3b82f6' : '#f1f5f9',
              color: activeTab === 'models' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('models')}
          >
            3D Models
          </button>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        {activeTab === 'rooms' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {mockRooms.map(room => (
              <div
                key={room._id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => handleRoomSelect(room)}
              >
                <div style={{
                  background: '#f3f4f6',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  🏠
                </div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{room.name}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
                    {room.layout.width}m × {room.layout.length}m
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {room.tags.map(tag => (
                      <span key={tag} style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px'
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'models' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {mockModels.map(model => (
              <div
                key={model._id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => handleModelSelect(model)}
              >
                <div style={{
                  background: '#f3f4f6',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  📦
                </div>
                <div style={{ padding: '12px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{model.name}</h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
                    {model.description}
                  </p>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {model.tags.map(tag => (
                      <span key={tag} style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px'
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatesSection;