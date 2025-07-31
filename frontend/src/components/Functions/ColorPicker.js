import React, { useState, useEffect } from 'react';
import './css/ColorPicker.css';

const ColorPicker = ({ selectedObject, onColorChange, onAIColorSuggestion }) => {
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [isLoading, setIsLoading] = useState(false);
  const [aiColors, setAiColors] = useState([]);

  useEffect(() => {
    if (selectedObject?.color) {
      setCurrentColor(selectedObject.color);
    }
  }, [selectedObject]);

  const handleColorChange = (newColor) => {
    setCurrentColor(newColor);
    if (onColorChange && selectedObject) {
      onColorChange(selectedObject.id, newColor);
    }
  };

  const handleAIColorSuggestion = async () => {
    if (!selectedObject) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/python/get-ai-color-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectName: selectedObject.name,
          objectCategory: selectedObject.category,
          currentColor: currentColor,
          context: 'interior_design'
        })
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.colors) {
        setAiColors(data.colors);
      }
    } catch (error) {
      console.error('Error getting AI color suggestions:', error);
      // Fallback to predefined colors based on object type
      const fallbackColors = getFallbackColors(selectedObject);
      setAiColors(fallbackColors);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackColors = (object) => {
    const colorSchemes = {
      furniture: [
        { name: 'Warm Brown', hex: '#8B4513', description: 'Classic wood tone' },
        { name: 'Modern Gray', hex: '#6B7280', description: 'Contemporary neutral' },
        { name: 'Cream White', hex: '#F5F5DC', description: 'Elegant light tone' },
        { name: 'Deep Blue', hex: '#1E3A8A', description: 'Bold accent color' }
      ],
      lighting: [
        { name: 'Warm Gold', hex: '#FFD700', description: 'Cozy ambient light' },
        { name: 'Cool Silver', hex: '#C0C0C0', description: 'Modern metallic' },
        { name: 'Bronze', hex: '#CD7F32', description: 'Vintage appeal' },
        { name: 'Black', hex: '#000000', description: 'Minimalist choice' }
      ],
      default: [
        { name: 'Natural White', hex: '#FAFAFA', description: 'Clean and fresh' },
        { name: 'Soft Beige', hex: '#F5F5DC', description: 'Warm neutral' },
        { name: 'Sage Green', hex: '#9CAF88', description: 'Calming natural' },
        { name: 'Charcoal', hex: '#36454F', description: 'Sophisticated dark' }
      ]
    };

    return colorSchemes[object.category] || colorSchemes.default;
  };

  const applyAIColor = (color) => {
    handleColorChange(color.hex);
    if (onAIColorSuggestion) {
      onAIColorSuggestion(selectedObject.id, color);
    }
  };

  if (!selectedObject) {
    return (
      <div className="color-picker-section">
        <p className="no-selection">Select an object to change its color</p>
      </div>
    );
  }

  return (
    <div className="color-picker-section">
      <div className="section-header">
        <h3>Object Color</h3>
        <p className="selected-object">{selectedObject.name}</p>
      </div>

      <div className="color-controls">
        <div className="manual-color">
          <label htmlFor="color-input">Choose Color:</label>
          <div className="color-input-group">
            <input
              id="color-input"
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="color-input"
            />
            <span className="color-value">{currentColor}</span>
          </div>
        </div>

        <div className="ai-color-section">
          <button
            className="ai-color-button"
            onClick={handleAIColorSuggestion}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Getting AI Suggestions...
              </>
            ) : (
              <>
                🎨 AI Color Suggestions
              </>
            )}
          </button>

          {aiColors.length > 0 && (
            <div className="ai-colors-grid">
              <h4>AI Recommended Colors:</h4>
              <div className="color-suggestions">
                {aiColors.map((color, index) => (
                  <div
                    key={index}
                    className="color-suggestion"
                    onClick={() => applyAIColor(color)}
                  >
                    <div
                      className="color-preview"
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="color-info">
                      <span className="color-name">{color.name}</span>
                      <span className="color-description">{color.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
