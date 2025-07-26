import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import './css/OTP.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const OTP = ({ value, onChange, disabled = false, length = 6 }) => {
  const handleChange = (e) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(newValue);
  };

  const handleClick = () => {
    document.getElementById('otp-input').focus();
  };

  return (
    <motion.div className="otp-container" {...fadeInUp}>
      <div className="otp-label">
        <KeyIcon className="otp-key-icon" />
        <span>Verification Code</span>
      </div>
      
      <div className="otp-input-wrapper">
        <input
          type="text"
          id="otp-input"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="otp-hidden-input"
          maxLength={length}
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        
        <div className="otp-boxes" onClick={handleClick}>
          {[...Array(length)].map((_, i) => (
            <div 
              key={i} 
              className={`otp-box ${i < value.length ? 'filled' : ''} ${i === value.length ? 'active' : ''}`}
            >
              {value[i] || ''}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OTP;
