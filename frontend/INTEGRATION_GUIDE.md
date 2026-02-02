# Frontend-Backend Connection Guide

## Quick Setup

### 1. Install Socket.IO Client
```bash
cd collaborative-code-canvas
npm install socket.io-client
```

### 2. Environment Variables
Create/Update `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:3002/api
VITE_SOCKET_URL=http://localhost:3002
```

### 3. Update Index.tsx (Example Integration)
```typescript
import { useEffect } from 'react';
import socketService from '@/services/socket';
import { authAPI } from '@/services/api';

// In your main component:
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    socketService.connect(token);
  }

  return () => {
    socketService.disconnect();
  };
}, []);
```

### 4. Update EditorPanel to Use Real Socket Events
```typescript
import socketService from '@/services/socket';

// Replace mock toast with real code execution:
const handleRun = () => {
  const roomId = activeRoom.id;
  const code = editorRef.current?.getValue();
  socketService.runCode(roomId, code, language);
};

// Listen for terminal output:
useEffect(() => {
  socketService.onTerminalOutput((data) => {
    // Update terminal with real output
    console.log('Terminal output:', data);
  });
}, []);
```

### 5. Backend Already Running
✅ Server: http://localhost:3002
✅ MongoDB: Connected
✅ Socket.IO: Ready

## API Usage Examples

### Authentication
```typescript
import { authAPI } from '@/services/api';

// Register
const response = await authAPI.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

// Save token
localStorage.setItem('token', response.data.token);
```

### Room Management
```typescript
import { roomAPI } from '@/services/api';

// Create room
const room = await roomAPI.createRoom({
  name: 'My Room',
  language: 'typescript'
});

// Join room
await roomAPI.joinRoom(room.data._id);
```

### Real-time Events
```typescript
import socketService from '@/services/socket';

// Join room
socketService.joinRoom(roomId, userId);

// Listen for code updates
socketService.onCodeUpdate(({ code, userId }) => {
  // Update editor
  editorRef.current?.setValue(code);
});

// Send code changes
socketService.sendCodeChange(roomId, newCode, userId);
```

## Next Steps
1. Install socket.io-client: `npm install socket.io-client`
2. Integrate services into components
3. Test real-time collaboration
4. Remove mock data from frontend
