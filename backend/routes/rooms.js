const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { auth } = require('../middleware/auth');

// Room routes
router.get('/rooms', roomController.getAllRooms);
router.get('/rooms/types', roomController.getRoomTypes);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', auth, roomController.createRoom);
router.put('/rooms/:id', auth, roomController.updateRoom);
router.delete('/rooms/:id', auth, roomController.deleteRoom);

// House template routes
router.get('/templates', roomController.getHouseTemplates);
router.get('/templates/:id', roomController.getHouseTemplateById);
router.post('/templates', auth, roomController.createHouseTemplate);
router.put('/templates/:id', auth, roomController.updateHouseTemplate);
router.delete('/templates/:id', auth, roomController.deleteHouseTemplate);

module.exports = router;
