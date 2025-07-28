import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import './css/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-brand">
              <BuildingOfficeIcon className="footer-logo-icon" />
              <span className="footer-brand-name">RenderHaus</span>
            </div>
            <p className="footer-description">
              Revolutionizing home design with cutting-edge 3D visualization technology. 
              Transform your ideas into immersive virtual experiences and bring your dream spaces to life.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" className="social-link" aria-label="Facebook">
                <span className="social-text">FB</span>
              </a>
              <a href="https://twitter.com" className="social-link" aria-label="Twitter">
                <span className="social-text">TW</span>
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Instagram">
                <span className="social-text">IG</span>
              </a>
              <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn">
                <span className="social-text">LI</span>
              </a>
              <a href="https://youtube.com" className="social-link" aria-label="YouTube">
                <span className="social-text">YT</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><RouterLink to="/">Home</RouterLink></li>
              <li><RouterLink to="/auth">Get Started</RouterLink></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li><a href="#services">3D Visualization</a></li>
              <li><a href="#services">Interior Design</a></li>
              <li><a href="#services">Material Library</a></li>
              <li><a href="#services">Room Templates</a></li>
              <li><a href="#services">Project Export</a></li>
              <li><a href="#services">Collaboration Tools</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><a href="#support">Help Center</a></li>
              <li><a href="#support">Documentation</a></li>
              <li><a href="#support">Video Tutorials</a></li>
              <li><a href="#support">Community Forum</a></li>
              <li><a href="#support">Contact Support</a></li>
              <li><a href="#support">System Requirements</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPinIcon className="contact-icon" />
                <span>123 Design Street, Creative District, San Francisco, CA 94102</span>
              </div>
              <div className="contact-item">
                <PhoneIcon className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <EnvelopeIcon className="contact-icon" />
                <span>hello@renderhaus.com</span>
              </div>
              <div className="contact-item">
                <GlobeAltIcon className="contact-icon" />
                <span>www.renderhaus.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest updates, design tips, and feature announcements delivered to your inbox.
            </p>
          </div>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input"
            />
            <button className="newsletter-button">
              Subscribe
              <ArrowTopRightOnSquareIcon className="newsletter-icon" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {currentYear} RenderHaus. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <span className="divider">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="divider">•</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
          <div className="footer-bottom-right">
            <p>Made with ❤️ in San Francisco</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
