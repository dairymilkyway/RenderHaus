import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import OTP from './OTP';
import './css/Auth.css';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const EmailVerification = ({ email, onVerificationSuccess, onBackToLogin }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Save tokens and user data
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast.success('Email verified successfully! Welcome to RenderHaus!', {
        onClose: () => {
          onVerificationSuccess();
        }
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      toast.success('Verification code sent to your email!');
      setTimer(60);
      setCanResend(false);
      setOtp('');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <motion.div 
          className="auth-box verification-box"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Section with Icon */}
          <motion.div className="verification-header" {...fadeInUp}>
            <div className="verification-icon-wrapper">
              <div className="verification-icon-bg">
                <EnvelopeIcon className="verification-main-icon" />
              </div>
              <div className="verification-badge">
                <ShieldCheckIcon className="badge-icon" />
              </div>
            </div>
          </motion.div>

          <motion.h2 
            className="verification-title"
            {...fadeInUp}
          >
            Verify Your Email
          </motion.h2>
          
          <motion.div 
            className="verification-subtitle"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            <p>We've sent a 6-digit verification code to</p>
            <div className="email-display">
              <EnvelopeIcon className="email-icon" />
              <span className="email-address">{email}</span>
            </div>
            <p className="verification-note">
              Enter the code below to verify your account
            </p>
          </motion.div>

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
            onSubmit={handleVerify}
            className="verification-form"
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
            <OTP 
              value={otp}
              onChange={setOtp}
              disabled={loading}
              length={6}
            />

            <motion.button
              type="submit"
              className="verification-button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              {...fadeInUp}
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <div className="button-loading">
                  <div className="loading-spinner"></div>
                  Verifying...
                </div>
              ) : (
                <>
                  <CheckCircleIcon className="button-icon" />
                  Verify Email
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div className="verification-footer" {...fadeInUp}>
            <div className="resend-section">
              {!canResend ? (
                <div className="timer-display">
                  <ClockIcon className="timer-icon" />
                  <span>Resend code in {formatTime(timer)}</span>
                </div>
              ) : (
                <button 
                  className="resend-link"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Code'}
                </button>
              )}
            </div>
            
            <div className="back-to-login">
              <span>Wrong email address? </span>
              <button 
                className="back-link"
                onClick={onBackToLogin}
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailVerification;
