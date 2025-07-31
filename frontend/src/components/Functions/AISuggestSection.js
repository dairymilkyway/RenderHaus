import React, { useState, useEffect } from 'react';
import { SparklesIcon, SwatchIcon, CubeIcon } from '@heroicons/react/24/outline';
import './css/Sections.css';

const AISuggestSection = ({ placedModels = [], onModelSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [colorSuggestions, setColorSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('AISuggestSection - placedModels:', placedModels);
  console.log('AISuggestSection - placedModels length:', placedModels?.length);

  const fetchAISuggestions = async () => {
    setLoading(true);
    setError(null);
    
    console.log('fetchAISuggestions - Starting with placedModels:', placedModels);
    
    try {
      const requestBody = {
        current_models: placedModels.map(model => ({
          name: model.name,
          category: model.category,
          position: model.position,
          // Include full model data for 3D analysis
          modelFile: model.modelFile,
          fileUrl: model.modelFile?.fileUrl || model.fileUrl,
          _id: model._id
        })),
        room_type: 'living_room'
      };
      
      console.log('fetchAISuggestions - Request body:', requestBody);
      
      const furnitureResponse = await fetch('http://localhost:5000/api/python/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('fetchAISuggestions - Furniture response status:', furnitureResponse.status);

      if (furnitureResponse.ok) {
        const furnitureData = await furnitureResponse.json();
        console.log('fetchAISuggestions - Furniture data:', furnitureData);
        setSuggestions(furnitureData.suggestions?.furniture_suggestions || []);
        // Get color suggestions from the same response
        setColorSuggestions(furnitureData.suggestions?.color_suggestions || []);
      }

    } catch (err) {
      setError('Failed to fetch AI suggestions. Make sure the Python backend is running.');
      console.error('AI suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (placedModels && placedModels.length > 0) {
      fetchAISuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedModels]);

  const handleSuggestionClick = (suggestion) => {
    console.log('AI Suggested:', suggestion);
    alert(`AI suggests: ${suggestion.furniture_type}\nReason: ${suggestion.reason}`);
  };

  return (
    <div className="sections-content" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="section-header" style={{
        flexShrink: 0,
        paddingBottom: '16px'
      }}>
        <SparklesIcon className="section-icon" />
        <h2>AI Suggestions</h2>
        <button 
          className="refresh-button"
          onClick={fetchAISuggestions}
          disabled={loading}
          style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '12px' }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingRight: '8px',
        paddingBottom: '20px'
      }}>
        {error && (
          <div style={{ 
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px' 
          }}>
            <p>{error}</p>
          </div>
        )}

        {(!placedModels || placedModels.length === 0) && !loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#666' 
          }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.5 }}>
              <SparklesIcon />
            </div>
            <p>Place some furniture first to get AI suggestions!</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              Debug: placedModels.length = {placedModels?.length || 0}
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px' 
            }}>
              <div style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                <CubeIcon />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Suggested Furniture ({suggestions.length})</h3>
            </div>
            <div>
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {suggestion.item || suggestion.furniture_type}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {suggestion.reason}
                  </div>
                  <div style={{ fontSize: '12px', color: '#007bff' }}>
                    Category: {suggestion.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {colorSuggestions.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px' 
            }}>
              <div style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                <SwatchIcon />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Suggested Colors</h3>
            </div>
            <div>
              {colorSuggestions.map((colorSuggestion, index) => (
                <div key={index} style={{
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  marginBottom: index === colorSuggestions.length - 1 ? '20px' : '8px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <div 
                    style={{ 
                      backgroundColor: colorSuggestion.color || colorSuggestion.hex_code,
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      marginRight: '12px',
                      border: '2px solid #e0e0e0',
                      flexShrink: 0,
                      marginTop: '4px'
                    }}
                    title={colorSuggestion.color || colorSuggestion.hex_code}
                  ></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {colorSuggestion.type ? `${colorSuggestion.type} Color` : (colorSuggestion.color || 'Color')}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666', 
                      lineHeight: '1.5',
                      wordWrap: 'break-word'
                    }}>
                      {colorSuggestion.description || colorSuggestion.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#007bff' 
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              margin: '0 auto 12px' 
            }}>
              <SparklesIcon />
            </div>
            <p>AI is analyzing your design...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestSection;