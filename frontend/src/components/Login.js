import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import './css/Auth.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const Login = ({ onSwitchToRegister, onShowEmailVerification }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Login failed';
        
        // Check if error is related to email verification
        if (errorMessage.includes('verify your email') && onShowEmailVerification) {
          // Show toast notification and auto-redirect after it closes
          toast.error('Please verify your email before logging in.', {
            onClose: () => {
              onShowEmailVerification(formData.email);
            }
          });
          return;
        }
        
        throw new Error(errorMessage);
      }

      // Save tokens and user data
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Dispatch custom event to update App state
      window.dispatchEvent(new Event('userLogin'));

      // Show success notification
      toast.success('Login successful! Welcome back!', {
        onClose: () => {
          // Force page refresh to ensure user state is updated
          if (data.data.user.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/dashboard';
          }
        }
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <motion.div 
          className="auth-box"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="auth-title"
            {...fadeInUp}
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            className="auth-subtitle"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Enter your details to access your account
          </motion.p>

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit}
            className="auth-form"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="initial"
            animate="animate"
          >
            <motion.div className="form-group" {...fadeInUp}>
              <label htmlFor="email">
                <EnvelopeIcon className="input-icon" />
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </motion.div>

            <motion.div className="form-group" {...fadeInUp}>
              <label htmlFor="password">
                <LockClosedIcon className="input-icon" />
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </motion.div>

            <motion.a 
              href="#" 
              className="forgot-password"
              {...fadeInUp}
            >
              Forgot your password?
            </motion.a>

            <motion.button
              type="submit"
              className="auth-button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              {...fadeInUp}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRightIcon className="button-icon" />
            </motion.button>
          </motion.form>

          <motion.p 
            className="auth-switch"
            {...fadeInUp}
          >
            Don't have an account?{" "}
            <button 
              className="switch-button"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Sign Up
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 