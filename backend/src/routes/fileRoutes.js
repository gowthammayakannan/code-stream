const express = require('express');
const {
    getFiles,
    createFile,
    getFile,
    updateFile,
    deleteFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(protect, getFiles).post(protect, createFile);

router.route('/:id').get(protect, getFile).put(protect, updateFile).delete(protect, deleteFile);

module.exports = router;
