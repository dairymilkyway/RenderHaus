import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import './css/Sections.css';

const AISuggestSection = () => {
  // eslint-disable-next-line no-unused-vars
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      title: 'Layout Optimization',
      description: 'Consider moving the sofa closer to the window for better natural lighting.',
      type: 'layout'
    },
    {
      id: 2,
      title: 'Color Harmony',
      description: 'Add accent pieces in navy blue to complement your current color scheme.',
      type: 'color'
    },
    {
      id: 3,
      title: 'Furniture Selection',
      description: 'A round coffee table would better suit your space and improve flow.',
      type: 'furniture'
    }
  ]);

  const [selectedType, setSelectedType] = useState('all');

  const filteredSuggestions = selectedType === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === selectedType);

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>AI Suggestions</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All
          </button>
          <button 
            className={`filter-button ${selectedType === 'layout' ? 'active' : ''}`}
            onClick={() => setSelectedType('layout')}
          >
            Layout
          </button>
          <button 
            className={`filter-button ${selectedType === 'color' ? 'active' : ''}`}
            onClick={() => setSelectedType('color')}
          >
            Color
          </button>
          <button 
            className={`filter-button ${selectedType === 'furniture' ? 'active' : ''}`}
            onClick={() => setSelectedType('furniture')}
          >
            Furniture
          </button>
        </div>
      </div>

      <div className="suggestions-list">
        {filteredSuggestions.map(suggestion => (
          <div key={suggestion.id} className="suggestion-card">
            <div className="suggestion-icon">
              <SparklesIcon />
            </div>
            <div className="suggestion-content">
              <h4>{suggestion.title}</h4>
              <p>{suggestion.description}</p>
              <div className="suggestion-actions">
                <button className="apply-button">Apply</button>
                <button className="dismiss-button">Dismiss</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="refresh-button">
        Get More Suggestions
      </button>
    </div>
  );
};

export default AISuggestSection; 