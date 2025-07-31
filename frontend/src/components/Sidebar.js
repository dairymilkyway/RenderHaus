import React from 'react';
import {
  Squares2X2Icon,
  SparklesIcon,
  ShareIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import './css/Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const handleSectionClick = (section) => {
    onSectionChange(section);
  };

  return (
    <div className="dashboard-sidebar">
      <div className="tool-section">
        <button 
          className={`tool-button ${activeSection === 'templates' ? 'active' : ''}`}
          onClick={() => handleSectionClick('templates')}
        >
          <Squares2X2Icon className="tool-icon" />
          <span>Templates</span>
        </button>
        <button 
          className={`tool-button ${activeSection === 'object-properties' ? 'active' : ''}`}
          onClick={() => handleSectionClick('object-properties')}
        >
          <WrenchScrewdriverIcon className="tool-icon" />
          <span>Object Properties</span>
        </button>
        <button 
          className={`tool-button ${activeSection === 'ai-suggestions' ? 'active' : ''}`}
          onClick={() => handleSectionClick('ai-suggestions')}
        >
          <SparklesIcon className="tool-icon" />
          <span>AI Suggestions</span>
        </button>
      </div>

      <div className="tool-section">
        <button 
          className={`tool-button ${activeSection === 'save-export' ? 'active' : ''}`}
          onClick={() => handleSectionClick('save-export')}
        >
          <ShareIcon className="tool-icon" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 