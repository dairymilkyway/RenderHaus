import React from 'react';
import './css/Sections.css';

const ViewSection = () => {
  return (
    <div className="section-container">
      <h2>View Settings</h2>
      <div className="view-options">
        <div className="view-group">
          <h3>Camera Angle</h3>
          <div className="option-buttons">
            <button className="view-button active">Top</button>
            <button className="view-button">Front</button>
            <button className="view-button">Side</button>
            <button className="view-button">Perspective</button>
          </div>
        </div>
        
        <div className="view-group">
          <h3>Display Mode</h3>
          <div className="option-buttons">
            <button className="view-button active">Rendered</button>
            <button className="view-button">Wireframe</button>
            <button className="view-button">Solid</button>
          </div>
        </div>

        <div className="view-group">
          <h3>Lighting</h3>
          <div className="lighting-controls">
            <div className="control-group">
              <label>Brightness</label>
              <input type="range" min="0" max="100" defaultValue="50" />
            </div>
            <div className="control-group">
              <label>Contrast</label>
              <input type="range" min="0" max="100" defaultValue="50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSection; 