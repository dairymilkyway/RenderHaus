import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import './css/Auth.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const Register = ({ onSwitchToLogin, onShowEmailVerification }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    gender: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Show success notification and redirect to email verification
      toast.success('Registration successful! Please check your email for verification code.', {
        onClose: () => {
          onShowEmailVerification(formData.email);
        }
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to register. Please try again.');
      console.error('Registration error:', err);
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
            Create Account
          </motion.h2>
          <motion.p 
            className="auth-subtitle"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Join us to start creating your 3D vision
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
              <label htmlFor="name">
                <UserIcon className="input-icon" />
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </motion.div>

            <motion.div className="form-group" {...fadeInUp}>
              <label htmlFor="gender">
                <UserIcon className="input-icon" />
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={loading}
                className="gender-select"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </motion.div>

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
                minLength="6"
                pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}"
                title="Password must be at least 6 characters long and contain at least one letter and one number"
              />
            </motion.div>

            <motion.button
              type="submit"
              className="auth-button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              {...fadeInUp}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRightIcon className="button-icon" />
            </motion.button>
          </motion.form>

          <motion.p 
            className="auth-switch"
            {...fadeInUp}
          >
            Already have an account?{" "}
            <button 
              className="switch-button"
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Sign In
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 