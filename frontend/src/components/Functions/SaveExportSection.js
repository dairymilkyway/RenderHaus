import React, { useState } from 'react';
import {
  CloudArrowUpIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  CodeBracketIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import './css/Sections.css';

const SaveExportSection = () => {
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState('2 minutes ago');
  const [selectedFormat, setSelectedFormat] = useState('3d');

  const handleSave = () => {
    // Implement save functionality
    setLastSaved('Just now');
  };

  const exportFormats = [
    { id: '3d', name: '3D Model', icon: CodeBracketIcon, formats: ['.obj', '.fbx', '.gltf'] },
    { id: 'image', name: 'Image', icon: PhotoIcon, formats: ['.png', '.jpg', '.pdf'] }
  ];

  return (
    <div className="section-container">
      <div className="save-section">
        <h2>Save Project</h2>
        
        <div className="auto-save-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={() => setAutoSave(!autoSave)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span>Auto-save {autoSave ? 'enabled' : 'disabled'}</span>
        </div>

        <div className="save-info">
          <p>Last saved: {lastSaved}</p>
          <button className="save-button" onClick={handleSave}>
            <CloudArrowUpIcon className="button-icon" />
            Save Now
          </button>
        </div>

        <div className="save-versions">
          <h3>Recent Versions</h3>
          <div className="version-list">
            <div className="version-item">
              <span>Version 1.2</span>
              <span className="version-time">2 hours ago</span>
              <button className="restore-button">Restore</button>
            </div>
            <div className="version-item">
              <span>Version 1.1</span>
              <span className="version-time">Yesterday</span>
              <button className="restore-button">Restore</button>
            </div>
          </div>
        </div>
      </div>

      <div className="export-section">
        <h2>Export Project</h2>
        
        <div className="format-selector">
          {exportFormats.map(format => (
            <button
              key={format.id}
              className={`format-button ${selectedFormat === format.id ? 'active' : ''}`}
              onClick={() => setSelectedFormat(format.id)}
            >
              <format.icon className="format-icon" />
              {format.name}
            </button>
          ))}
        </div>

        <div className="format-options">
          <h3>Export Options</h3>
          <div className="format-list">
            {exportFormats.find(f => f.id === selectedFormat).formats.map(format => (
              <button key={format} className="export-button">
                <ArrowDownTrayIcon className="button-icon" />
                Export as {format}
              </button>
            ))}
          </div>
        </div>

        <div className="share-section">
          <h3>Share Project</h3>
          <div className="share-buttons">
            <button className="share-button">
              <ShareIcon className="button-icon" />
              Share Link
            </button>
            <button className="share-button">
              <DocumentDuplicateIcon className="button-icon" />
              Duplicate Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveExportSection; 