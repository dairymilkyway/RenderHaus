import React from 'react';
import {
  Squares2X2Icon,
  CubeIcon,
  SwatchIcon,
  CameraIcon,
  SparklesIcon,
  LightBulbIcon,
  CloudArrowUpIcon,
  ShareIcon,
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
          className={`tool-button ${activeSection === 'components' ? 'active' : ''}`}
          onClick={() => handleSectionClick('components')}
        >
          <CubeIcon className="tool-icon" />
          <span>Components</span>
        </button>
        <button 
          className={`tool-button ${activeSection === 'materials' ? 'active' : ''}`}
          onClick={() => handleSectionClick('materials')}
        >
          <SwatchIcon className="tool-icon" />
          <span>Materials</span>
        </button>
        <button 
          className={`tool-button ${activeSection === 'view' ? 'active' : ''}`}
          onClick={() => handleSectionClick('view')}
        >
          <CameraIcon className="tool-icon" />
          <span>View</span>
        </button>
      </div>

      <div className="tool-section">
        <button 
          className={`tool-button ai-button ${activeSection === 'ai-suggest' ? 'active' : ''}`}
          onClick={() => handleSectionClick('ai-suggest')}
        >
          <SparklesIcon className="tool-icon" />
          <span>AI Suggest</span>
        </button>
        <button 
          className={`tool-button ai-button ${activeSection === 'ai-explain' ? 'active' : ''}`}
          onClick={() => handleSectionClick('ai-explain')}
        >
          <LightBulbIcon className="tool-icon" />
          <span>AI Explain</span>
        </button>
      </div>

      <div className="tool-section">
        <button 
          className={`tool-button ${activeSection === 'save-export' ? 'active' : ''}`}
          onClick={() => handleSectionClick('save-export')}
        >
          <CloudArrowUpIcon className="tool-icon" />
          <span>Save</span>
        </button>
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