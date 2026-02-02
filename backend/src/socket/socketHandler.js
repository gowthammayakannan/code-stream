const Room = require('../models/Room');
const { executeCode } = require('../services/pistonService');

module.exports = (io) => {
    // Store active socket connections by room
    const rooms = new Map();

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.id}`);

        // Join room
        socket.on('join-room', async ({ roomId, userId }) => {
            try {
                socket.join(roomId);

                // Add socket to room map
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Set());
                }
                rooms.get(roomId).add(socket.id);

                // Update participant status in database
                const room = await Room.findById(roomId).populate('participants.userId', 'name avatar color');

                if (room) {
                    const participant = room.participants.find((p) => p.userId._id.toString() === userId);
                    if (participant) {
                        participant.isOnline = true;
                        await room.save();
                    }

                    // Notify room about new user
                    io.to(roomId).emit('user-joined', {
                        userId,
                        participants: room.participants,
                    });

                    // Send current state to joining user
                    socket.emit('room-state', {
                        code: room.codeBuffer,
                        language: room.language,
                        participants: room.participants,
                    });
                }

                console.log(`👤 User ${userId} joined room ${roomId}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Leave room
        socket.on('leave-room', async ({ roomId, userId }) => {
            try {
                socket.leave(roomId);

                // Remove from room map
                if (rooms.has(roomId)) {
                    rooms.get(roomId).delete(socket.id);
                    if (rooms.get(roomId).size === 0) {
                        rooms.delete(roomId);
                    }
                }

                // Update participant status
                const room = await Room.findById(roomId);
                if (room) {
                    const participant = room.participants.find((p) => p.userId.toString() === userId);
                    if (participant) {
                        participant.isOnline = false;
                        await room.save();
                    }

                    io.to(roomId).emit('user-left', { userId });
                }

                console.log(`👋 User ${userId} left room ${roomId}`);
            } catch (error) {
                console.error('Leave room error:', error);
            }
        });

        // Code synchronization
        socket.on('code-change', async ({ roomId, code, userId }) => {
            try {
                // Update room's code buffer
                await Room.findByIdAndUpdate(roomId, { codeBuffer: code });

                // Broadcast to all other users in the room
                socket.to(roomId).emit('code-update', {
                    code,
                    userId,
                    timestamp: Date.now(),
                });
            } catch (error) {
                console.error('Code change error:', error);
            }
        });

        // Cursor tracking
        socket.on('cursor-move', async ({ roomId, userId, line, column }) => {
            try {
                // Update cursor position in database
                const room = await Room.findById(roomId);
                if (room) {
                    const participant = room.participants.find((p) => p.userId.toString() === userId);
                    if (participant) {
                        participant.cursorPosition = { line, column };
                        await room.save();
                    }
                }

                // Broadcast cursor position
                socket.to(roomId).emit('cursor-update', {
                    userId,
                    line,
                    column,
                });
            } catch (error) {
                console.error('Cursor move error:', error);
            }
        });

        // Language change
        socket.on('language-change', async ({ roomId, language }) => {
            try {
                await Room.findByIdAndUpdate(roomId, { language });

                io.to(roomId).emit('language-update', { language });
            } catch (error) {
                console.error('Language change error:', error);
            }
        });

        // Run code
        socket.on('run-code', async ({ roomId, code, language }) => {
            try {
                // Emit running status
                io.to(roomId).emit('terminal-output', {
                    type: 'system',
                    content: '> Executing code...',
                    timestamp: Date.now(),
                });

                // Execute code
                const result = await executeCode(language, code);

                // Send output
                if (result.stderr) {
                    io.to(roomId).emit('terminal-output', {
                        type: 'stderr',
                        content: result.stderr,
                        timestamp: Date.now(),
                    });
                }

                if (result.output) {
                    io.to(roomId).emit('terminal-output', {
                        type: 'stdout',
                        content: result.output,
                        timestamp: Date.now(),
                    });
                }

                // Send completion status
                io.to(roomId).emit('terminal-output', {
                    type: 'system',
                    content: result.success ? '✓ Execution completed' : '✗ Execution failed',
                    timestamp: Date.now(),
                });
            } catch (error) {
                io.to(roomId).emit('terminal-output', {
                    type: 'stderr',
                    content: `Error: ${error.message}`,
                    timestamp: Date.now(),
                });
            }
        });

        // Disconnection
        socket.on('disconnect', async () => {
            console.log(`❌ User disconnected: ${socket.id}`);

            // Find and clean up rooms
            for (const [roomId, sockets] of rooms.entries()) {
                if (sockets.has(socket.id)) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        rooms.delete(roomId);
                    }
                }
            }
        });
    });
};
