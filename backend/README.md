# Collaborative Code Canvas - Backend API

Complete backend implementation for real-time collaborative code editing platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm start          # Production
npm run dev        # Development (nodemon)
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Rooms
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms` | List all rooms | Yes |
| POST | `/api/rooms` | Create room | Yes |
| GET | `/api/rooms/:id` | Get room details | Yes |
| PUT | `/api/rooms/:id` | Update room | Yes |
| DELETE | `/api/rooms/:id` | Delete room | Yes |
| POST | `/api/rooms/:id/join` | Join room | Yes |
| POST | `/api/rooms/:id/leave` | Leave room | Yes |

### Files
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms/:roomId/files` | Get file tree | Yes |
| POST | `/api/rooms/:roomId/files` | Create file/folder | Yes |
| GET | `/api/rooms/:roomId/files/:id` | Get file | Yes |
| PUT | `/api/rooms/:roomId/files/:id` | Update file | Yes |
| DELETE | `/api/rooms/:roomId/files/:id` | Delete file | Yes |

## 🔌 Socket.IO Events

### Client → Server
- `join-room` - Join collaboration room
- `leave-room` - Leave room
- `code-change` - Send code updates
- `cursor-move` - Update cursor position
- `language-change` - Change programming language
- `run-code` - Execute code

### Server → Client
- `user-joined` - User joined room
- `user-left` - User left room
- `room-state` - Current room state
- `code-update` - Code synchronized
- `cursor-update` - Cursor position update
- `language-update` - Language changed
- `terminal-output` - Code execution output

## 🌐 Environment Variables

```env
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/codecanvas
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h
CORS_ORIGIN=http://localhost:8080
PISTON_API_URL=https://emkc.org/api/v2/piston
```

## 📦 Tech Stack
- **Framework:** Express.js 5.2.1
- **Database:** MongoDB (Mongoose 9.1.5)
- **Real-time:** Socket.IO 4.8.3
- **Auth:** JWT + bcryptjs
- **Code Execution:** Piston API (7 languages)

## 🏗️ Project Structure
```
src/
├── config/          # Database & configs
├── models/          # Mongoose schemas
├── controllers/     # Business logic
├── routes/          # API routes
├── middleware/      # Auth, validation, errors
├── socket/          # Socket.IO handlers
├── services/        # External services (Piston)
└── server.js        # Entry point
```

## 🔒 Security Features
- JWT authentication with 24h expiration
- Password hashing (bcrypt)
- CORS protection
- Input validation
- Error handling

## 🧪 Testing
```bash
# Health check
curl http://localhost:3002/api/health

# Register user
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

## 📄 License
MIT
