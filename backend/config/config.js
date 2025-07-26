const dotenv = require('dotenv');

// Load env vars
dotenv.config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/renderhaus',
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  
  // Security configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Email configuration
  email: {
    otpExpiry: 10 * 60 * 1000, // 10 minutes in milliseconds
    mailtrap: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  }
}; 