const Room = require('../models/Room');
const HouseTemplate = require('../models/HouseTemplate');

// Room Controllers

// Get all room templates
const getAllRooms = async (req, res) => {
  try {
    const { type, style, minArea, maxArea } = req.query;
    
    let filter = {};
    if (type) filter.type = type;
    if (style) filter.style = style;
    
    const rooms = await Room.find(filter).populate('fixtures.modelId');
    
    // Filter by area if specified
    let filteredRooms = rooms;
    if (minArea || maxArea) {
      filteredRooms = rooms.filter(room => {
        const area = room.layout.width * room.layout.length;
        if (minArea && area < minArea) return false;
        if (maxArea && area > maxArea) return false;
        return true;
      });
    }
    
    res.json({
      status: 'success',
      data: filteredRooms
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Get single room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id).populate('fixtures.modelId');
    
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }
    
    res.json({
      status: 'success',
      data: room
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Create custom room
const createRoom = async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json({
      status: 'success',
      data: room
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }
    
    res.json({
      status: 'success',
      data: room
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Delete room
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByIdAndDelete(id);
    
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// House Template Controllers

// Get house templates
const getHouseTemplates = async (req, res) => {
  try {
    const { category, bedrooms, bathrooms, style, priceRange } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (bedrooms) filter['specifications.bedrooms'] = bedrooms;
    if (bathrooms) filter['specifications.bathrooms'] = bathrooms;
    if (style) filter['exterior.style'] = style;
    if (priceRange) filter.priceRange = priceRange;
    
    const templates = await HouseTemplate.find(filter)
      .populate('floors.rooms.roomId')
      .populate('floors.rooms.roomId.fixtures.modelId');
    
    res.json({
      status: 'success',
      data: templates
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Get single house template by ID
const getHouseTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await HouseTemplate.findById(id)
      .populate('floors.rooms.roomId')
      .populate('floors.rooms.roomId.fixtures.modelId')
      .populate('exterior.facade.features.modelId')
      .populate('exterior.landscaping.modelId');
    
    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'House template not found'
      });
    }
    
    // Increment download count
    await HouseTemplate.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
    
    res.json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Create house template
const createHouseTemplate = async (req, res) => {
  try {
    const template = new HouseTemplate(req.body);
    await template.save();
    res.status(201).json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Update house template
const updateHouseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await HouseTemplate.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'House template not found'
      });
    }
    
    res.json({
      status: 'success',
      data: template
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Delete house template
const deleteHouseTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await HouseTemplate.findByIdAndDelete(id);
    
    if (!template) {
      return res.status(404).json({
        status: 'error',
        message: 'House template not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'House template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

// Get room types
const getRoomTypes = async (req, res) => {
  try {
    const roomTypes = await Room.distinct('type');
    res.json({
      status: 'success',
      data: roomTypes
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
};

module.exports = {
  // Room controllers
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomTypes,
  
  // House template controllers
  getHouseTemplates,
  getHouseTemplateById,
  createHouseTemplate,
  updateHouseTemplate,
  deleteHouseTemplate
};
