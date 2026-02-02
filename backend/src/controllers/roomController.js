const Room = require('../models/Room');
const User = require('../models/User');
const { TEMPLATES } = require('../utils/templates');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            'participants.userId': req.user.id
        })
            .populate('ownerId', 'name email avatar color')
            .populate('participants.userId', 'name avatar color')
            .sort({ lastActivity: -1 });

        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
    console.log('--- CREATE ROOM START ---');
    console.log('Body:', req.body);
    console.log('User:', req.user ? req.user._id : 'No User');
    try {
        const { name, language } = req.body;
        const selectedLanguage = language || 'typescript';
        const template = TEMPLATES[selectedLanguage] || '';

        const room = await Room.create({
            name,
            language: selectedLanguage,
            codeBuffer: template,
            ownerId: req.user.id,
            participants: [{ userId: req.user.id }],
        });

        // Create default file for the room
        const File = require('../models/File');
        const defaultFileName = selectedLanguage === 'python' ? 'main.py' :
            selectedLanguage === 'javascript' ? 'index.js' :
                selectedLanguage === 'cpp' ? 'main.cpp' :
                    `main.${selectedLanguage}`;

        await File.create({
            roomId: room._id,
            name: defaultFileName,
            type: 'file',
            language: selectedLanguage,
            path: defaultFileName,
            content: template,
            createdBy: req.user.id
        });

        await room.populate([
            { path: 'ownerId', select: 'name email avatar color' },
            { path: 'participants.userId', select: 'name avatar color' }
        ]);

        console.log('Room and default file created:', room._id);

        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('ownerId', 'name email avatar color')
            .populate('participants.userId', 'name avatar color');

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private
exports.updateRoom = async (req, res) => {
    try {
        let room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Check ownership
        if (room.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
        }

        room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Check ownership
        if (room.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
        }

        await room.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Join room
// @route   POST /api/rooms/:id/join
// @access  Private
exports.joinRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Check if user already in room
        const alreadyJoined = room.participants.some((p) => p.userId.toString() === req.user.id);

        if (!alreadyJoined) {
            room.participants.push({ userId: req.user.id });
            await room.save();
        }

        await room.populate('participants.userId', 'name avatar color');

        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Leave room
// @route   POST /api/rooms/:id/leave
// @access  Private
exports.leaveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        room.participants = room.participants.filter((p) => p.userId.toString() !== req.user.id);
        await room.save();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
