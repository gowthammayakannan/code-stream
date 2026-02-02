const express = require('express');
const {
    getRooms,
    createRoom,
    getRoom,
    updateRoom,
    deleteRoom,
    joinRoom,
    leaveRoom,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getRooms).post(protect, createRoom);

router.route('/:id').get(protect, getRoom).put(protect, updateRoom).delete(protect, deleteRoom);

router.post('/:id/join', protect, joinRoom);
router.post('/:id/leave', protect, leaveRoom);

module.exports = router;
