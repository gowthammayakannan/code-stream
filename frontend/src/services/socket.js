import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Room events
    joinRoom(roomId, userId) {
        this.socket?.emit('join-room', { roomId, userId });
    }

    leaveRoom(roomId, userId) {
        this.socket?.emit('leave-room', { roomId, userId });
    }

    // Code sync
    sendCodeChange(roomId, code, userId) {
        this.socket?.emit('code-change', { roomId, code, userId });
    }

    onCodeUpdate(callback) {
        this.socket?.on('code-update', callback);
    }

    // Cursor tracking
    sendCursorMove(roomId, userId, line, column) {
        this.socket?.emit('cursor-move', { roomId, userId, line, column });
    }

    onCursorUpdate(callback) {
        this.socket?.on('cursor-update', callback);
    }

    // Language change
    sendLanguageChange(roomId, language) {
        this.socket?.emit('language-change', { roomId, language });
    }

    onLanguageUpdate(callback) {
        this.socket?.on('language-update', callback);
    }

    // Code execution
    runCode(roomId, code, language) {
        this.socket?.emit('run-code', { roomId, code, language });
    }

    onTerminalOutput(callback) {
        this.socket?.on('terminal-output', callback);
    }

    // Participant updates
    onUserJoined(callback) {
        this.socket?.on('user-joined', callback);
    }

    onUserLeft(callback) {
        this.socket?.on('user-left', callback);
    }

    onRoomState(callback) {
        this.socket?.on('room-state', callback);
    }
}

export default new SocketService();
