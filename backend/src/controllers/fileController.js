const File = require('../models/File');
const Room = require('../models/Room');

// @desc    Get file tree for a room
// @route   GET /api/rooms/:roomId/files
// @access  Private
const getFiles = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Verify room exists and user is participant
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Get all files for this room
        const files = await File.find({ roomId }).populate('createdBy', 'name avatar');

        // Build tree structure
        const fileTree = buildFileTree(files);

        res.status(200).json({ success: true, data: fileTree });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new file or folder
// @route   POST /api/rooms/:roomId/files
// @access  Private
const createFile = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { name, type, language, parentId, content } = req.body;

        // Verify room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Build path
        let path = name;
        if (parentId) {
            const parent = await File.findById(parentId);
            if (parent) {
                path = `${parent.path}/${name}`;
            }
        }

        const file = await File.create({
            roomId,
            name,
            type,
            language,
            path,
            content: content || '',
            parentId: parentId || null,
            createdBy: req.user.id,
        });

        await file.populate('createdBy', 'name avatar');

        res.status(201).json({ success: true, data: file });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single file
// @route   GET /api/rooms/:roomId/files/:id
// @access  Private
const getFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id).populate('createdBy', 'name avatar');

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        res.status(200).json({ success: true, data: file });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update file content
// @route   PUT /api/rooms/:roomId/files/:id
// @access  Private
const updateFile = async (req, res) => {
    try {
        let file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        file = await File.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: file });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete file or folder
// @route   DELETE /api/rooms/:roomId/files/:id
// @access  Private
const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // If folder, delete all children recursively
        if (file.type === 'folder') {
            await deleteChildren(file._id);
        }

        await file.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper: Build tree structure from flat file list
const buildFileTree = (files) => {
    const fileMap = new Map();
    const roots = [];

    // Create map of all files
    files.forEach((file) => {
        fileMap.set(file._id.toString(), { ...file.toObject(), children: [] });
    });

    // Build tree
    files.forEach((file) => {
        const fileObj = fileMap.get(file._id.toString());
        if (file.parentId) {
            const parent = fileMap.get(file.parentId.toString());
            if (parent) {
                parent.children.push(fileObj);
            }
        } else {
            roots.push(fileObj);
        }
    });

    return roots;
};

// Helper: Recursively delete children
const deleteChildren = async (parentId) => {
    const children = await File.find({ parentId });
    for (const child of children) {
        if (child.type === 'folder') {
            await deleteChildren(child._id);
        }
        await child.deleteOne();
    }
};

module.exports = {
    getFiles,
    createFile,
    getFile,
    updateFile,
    deleteFile,
};
