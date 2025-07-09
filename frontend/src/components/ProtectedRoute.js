import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const accessToken = localStorage.getItem('accessToken');
  let user = null;

  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user'); // Clear invalid data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return <Navigate to="/auth" replace />;
  }

  if (!accessToken || !user) {
    // Not logged in or no user data, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User's role is not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized, render component
  return children;
};

export default ProtectedRoute; 