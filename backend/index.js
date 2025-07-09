const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const config = require('./config/config');
const logger = require('./utils/logger');
const { AppError } = require('./utils/errors');

const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors(config.cors));
app.use(rateLimit(config.rateLimit));
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent parameter pollution

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('MongoDB Connected'))
.catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));

// 404 handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    logger.error('Error 💥:', {
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Log error
    logger.error('Error 💥:', err);

    // Send generic message
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong!'
    });
  }
});

const PORT = config.port;
app.listen(PORT, () => logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`)); 