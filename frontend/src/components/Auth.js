import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import './Auth.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
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
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h2>
          <motion.p 
            className="auth-subtitle"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            {isLogin 
              ? 'Enter your details to access your account'
              : 'Join us to start creating your 3D vision'}
          </motion.p>

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
            {!isLogin && (
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
                  required={!isLogin}
                />
              </motion.div>
            )}

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
              />
            </motion.div>

            {isLogin && (
              <motion.a 
                href="#" 
                className="forgot-password"
                {...fadeInUp}
              >
                Forgot your password?
              </motion.a>
            )}

            <motion.button
              type="submit"
              className="auth-button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              {...fadeInUp}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRightIcon className="button-icon" />
            </motion.button>
          </motion.form>

          <motion.p 
            className="auth-switch"
            {...fadeInUp}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="switch-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}; 