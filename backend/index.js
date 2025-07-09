require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/renderhaus')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Python backend health check
const checkPythonBackend = async () => {
  try {
    const response = await axios.get(`http://localhost:${process.env.PYTHON_PORT || 5001}/api/python/health`);
    console.log('Python backend status:', response.data);
    return true;
  } catch (error) {
    console.error('Python backend error:', error.message);
    return false;
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));

// Python backend proxy route
app.use('/api/python', async (req, res, next) => {
  try {
    const pythonUrl = `http://localhost:${process.env.PYTHON_PORT || 5001}${req.url}`;
    const response = await axios({
      method: req.method,
      url: pythonUrl,
      data: req.body,
      headers: req.headers
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Node.js server running on port ${PORT}`);
  await checkPythonBackend();
}); 