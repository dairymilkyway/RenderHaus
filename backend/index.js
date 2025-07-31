require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Configure for large file uploads
app.use(express.raw({ limit: '300mb' }));
app.use(express.text({ limit: '300mb' }));

// Middleware
app.use(cors());
app.use(express.json({ limit: '300mb' }));
app.use(express.urlencoded({ limit: '300mb', extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/renderhaus')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/models', require('./routes/models'));
app.use('/api/design', require('./routes/rooms'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/projects', require('./routes/projects'));

// Admin routes
app.use('/api/admin/projects', require('./routes/admin/projects'));

// AI Color Suggestions route
app.use('/api/python', require('./routes/aiColorSuggestions'));

// Python backend proxy route
app.use('/api/python', async (req, res, next) => {
  try {
    // Keep the full path including /api/python prefix
    const pythonUrl = `http://localhost:${process.env.PYTHON_PORT || 5001}${req.originalUrl}`;
    
    console.log(`Proxying to Python backend: ${pythonUrl}`);
    
    const response = await axios({
      method: req.method,
      url: pythonUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Python backend proxy error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Python backend connection failed'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    type: err.type,
    code: err.code,
    status: err.status
  });
  
  // Handle specific errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      message: 'File too large. Maximum size allowed is 300MB.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: 'error',
      message: 'File size exceeds the limit. Maximum allowed is 250MB.'
    });
  }
  
  console.error('Error details:', {
    message: err.message,
    type: err.name,
    code: err.code,
    status: err.status
  });
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({ 
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Node.js server running on port ${PORT}`);
});

// Configure server for large file uploads
server.timeout = 10 * 60 * 1000; // 10 minutes timeout
server.maxHeadersCount = 0; // Remove limit on header count
server.keepAliveTimeout = 10 * 60 * 1000; // 10 minutes keep-alive 