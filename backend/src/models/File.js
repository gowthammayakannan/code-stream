const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'Please provide a file name'],
            trim: true,
        },
        path: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['file', 'folder'],
            required: true,
        },
        language: {
            type: String,
            enum: ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'cpp', null],
        },
        content: {
            type: String,
            default: '',
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File',
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Create index for faster queries
fileSchema.index({ roomId: 1, parentId: 1 });

module.exports = mongoose.model('File', fileSchema);
