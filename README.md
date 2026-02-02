# 🚀 CodeStream

**CodeStream** is a high-performance, real-time collaborative code editor designed for modern development teams. It enables multiple developers to write, execute, and sync code instantly across the globe with zero latency.

🔗 **Live Demo: [code-stream-chi.vercel.app](https://code-stream-chi.vercel.app)**

![CodeStream Header](https://raw.githubusercontent.com/gowthammayakannan/code-stream/main/frontend/public/favicon.svg)

## ✨ Key Features

- **Real-time Collaboration**: Write code together in perfect sync using modern WebSocket technology.
- **Instant Code Execution**: Execute your code snippets directly within the browser with support for multiple languages.
- **Global Data Sync**: Collaborative state management ensuring all participants see the same code, cursor, and files instantly.
- **Premium Developer Experience**:
  - Custom Male-biased Avatar Generation (DiceBear API).
  - Modern Glassmorphic UI with Neon Aesthetics (Cyan, Purple, Magenta).
  - Built-in Terminal for execution feedback.
- **Secure Authentication**: Integrated with GitHub OAuth for a seamless developer login experience.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Modern Aesthetics)
- Lucide React (Icons)
- Socket.io Client (Real-time)
- Shadcn UI (Components)

**Backend:**
- Node.js & Express
- Socket.io (WebSocket Server)
- MongoDB Atlas (Persistence)
- GitHub OAuth 2.0 (Security)

## 📦 Project Structure

```bash
code-stream/
├── frontend/    # React SPA (Vite + Tailwind)
└── backend/     # Node.js Express Server + Socket.io
```

## 🚀 Quick Start (Local)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/gowthammayakannan/code-stream.git
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Add your .env (MONGO_URI, GITHUB credentials)
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🌐 Deployment

For step-by-step production deployment instructions, check out:
👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

## 🛡️ License

Distributed under the MIT License.

---
Built with ❤️ for the developer community.
