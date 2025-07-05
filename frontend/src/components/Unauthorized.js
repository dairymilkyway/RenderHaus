import React from 'react';
import { Link } from 'react-router-dom';
import './css/Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>Access Denied</h1>
        <p>Sorry, you don't have permission to access this page.</p>
        <p>Please contact your administrator if you believe this is a mistake.</p>
        <Link to="/" className="back-home-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized; 