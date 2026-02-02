require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const socketHandler = require('./socket/socketHandler');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5175', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/rooms/:roomId/files', fileRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running!' });
});

// Socket.IO connection handler
socketHandler(io);

// 404 Not Found handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
});
