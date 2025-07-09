import React from 'react';
import { CubeIcon } from '@heroicons/react/24/outline';
import './css/Canvas.css';

const Canvas = () => {
  return (
    <div className="design-canvas">
      <div className="canvas-placeholder">
        <CubeIcon className="placeholder-icon" />
        <p>Select a template or start with a blank canvas</p>
      </div>
    </div>
  );
};

export default Canvas; 