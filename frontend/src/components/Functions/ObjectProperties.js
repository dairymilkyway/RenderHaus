import React from 'react';
import ColorPicker from './ColorPicker';
import './css/ObjectProperties.css';

const ObjectProperties = ({ 
  selectedObject, 
  onColorChange, 
  onAIColorSuggestion,
  onColorReset,
  onObjectDelete 
}) => {
  
  const handleDeleteObject = () => {
    if (onObjectDelete && selectedObject) {
      onObjectDelete(selectedObject.id);
    }
  };

  const handleColorReset = () => {
    if (onColorReset && selectedObject) {
      onColorReset(selectedObject.id);
    }
  };

  if (!selectedObject) {
    return (
      <div className="object-properties">
        <div className="no-selection-message">
          <div className="no-selection-icon">📦</div>
          <h3>No Object Selected</h3>
          <p>Click on a 3D object in the scene to view and edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="object-properties">
      <div className="properties-header">
        <h2>Object Properties</h2>
        <button 
          className="delete-object-btn"
          onClick={handleDeleteObject}
          title="Delete Object"
        >
          🗑️
        </button>
      </div>

      <div className="object-info">
        <h3>{selectedObject.name}</h3>
        <p className="object-category">{selectedObject.category}</p>
      </div>

      {/* Color Section */}
      <div className="property-section">
        <ColorPicker
          selectedObject={selectedObject}
          onColorChange={onColorChange}
          onAIColorSuggestion={onAIColorSuggestion}
        />
        
        {/* Reset Color Button */}
        <div className="color-actions">
          <button 
            className="reset-color-btn"
            onClick={handleColorReset}
            title="Reset to original color"
          >
            🔄 Reset Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectProperties;
