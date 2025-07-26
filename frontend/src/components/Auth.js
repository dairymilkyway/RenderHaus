import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import EmailVerification from './EmailVerification';

const Auth = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'verify'
  const [userEmail, setUserEmail] = useState('');

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleShowEmailVerification = (email) => {
    setUserEmail(email);
    setCurrentView('verify');
  };

  const handleVerificationSuccess = () => {
    // Redirect to dashboard after successful verification
    window.location.href = '/dashboard';
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'register':
        return (
          <Register 
            onSwitchToLogin={handleSwitchToLogin}
            onShowEmailVerification={handleShowEmailVerification}
          />
        );
      case 'verify':
        return (
          <EmailVerification 
            email={userEmail}
            onVerificationSuccess={handleVerificationSuccess}
            onBackToLogin={handleSwitchToLogin}
          />
        );
      case 'login':
      default:
        return (
          <Login 
            onSwitchToRegister={handleSwitchToRegister}
            onShowEmailVerification={handleShowEmailVerification}
          />
        );
    }
  };

  return renderCurrentView();
};

export default Auth;
