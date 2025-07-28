import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import AdminDashboard from './components/Admins/AdminDashboard';
import UserManagement from './components/Admins/UserManagement';
import ProjectManagement from './components/Admins/ProjectManagement';
import ModelManagement from './components/Admins/ModelManagement';
import ReportManagement from './components/Admins/ReportManagement';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Listen for storage changes to update user state when login happens
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    const handleLogout = () => {
      setUser(null);
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events we'll dispatch on login/logout
    window.addEventListener('userLogin', handleStorageChange);
    window.addEventListener('userLogout', handleLogout);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleLogout);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const AuthComponent = () => {
    if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
    return <Auth />;
  };

  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Admin Routes - without regular navbar */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/models"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ModelManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportManagement />
              </ProtectedRoute>
            }
          />
          {/* Regular Routes - with navbar */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          {/* Public and User Routes */}
          <Route path="/" element={
            <>
              <Navbar user={user} onLogout={handleLogout} />
              <main className="main-content">
                <LandingPage />
              </main>
            </>
          } />
          <Route path="/auth" element={
            <>
              <Navbar user={user} onLogout={handleLogout} />
              <main className="main-content">
                <AuthComponent />
              </main>
            </>
          } />
          <Route
            path="/dashboard"
            element={
              <>
                <Navbar user={user} onLogout={handleLogout} />
                <main className="main-content">
                  <ProtectedRoute allowedRoles={['user', 'admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                </main>
              </>
            }
          />
          <Route path="/unauthorized" element={
            <>
              <Navbar user={user} onLogout={handleLogout} />
              <main className="main-content">
                <Unauthorized />
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
