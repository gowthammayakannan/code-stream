const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a room name'],
            trim: true,
        },
        language: {
            type: String,
            enum: ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'cpp'],
            default: 'typescript',
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
                isOnline: {
                    type: Boolean,
                    default: true,
                },
                cursorPosition: {
                    line: { type: Number, default: 1 },
                    column: { type: Number, default: 1 },
                },
            },
        ],
        codeBuffer: {
            type: String,
            default: '',
        },
        syncStatus: {
            type: String,
            enum: ['synced', 'syncing', 'offline'],
            default: 'synced',
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('Room', roomSchema);
