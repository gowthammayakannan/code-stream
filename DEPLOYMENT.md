# Deployment Guide for CodeStream (Monorepo)

Your project is now organized as a monorepo:
- `/frontend` -> React App
- `/backend` -> Socket.io Server

---

## Part 1: Backend Deployment (Render)

1. Push code to GitHub.
2. Go to [Render](https://dashboard.render.com/) -> **New Web Service**.
3. Select your `code-stream` repo.
4. **Root Directory**: `backend`
5. **Build Command**: `npm install`
6. **Start Command**: `node src/server.js` (or `node src/index.js` depending on your entry point)
7. **Environment Variables**:
   - `PORT`: `3002`
   - `MONGO_URI`: (Your MongoDB Atlas URI)
   - `GITHUB_CLIENT_ID`: (From GitHub Settings)
   - `GITHUB_CLIENT_SECRET`: (From GitHub Settings)
   - `CORS_ORIGIN`: (Your Vercel URL - update this after Part 2)

---

## Part 2: Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/) -> **New Project**.
2. Select your `code-stream` repo.
3. **Root Directory**: `frontend`
4. **Framework Preset**: `Vite`
5. **Environment Variables**:
   - `VITE_API_URL`: (Your Render URL, e.g., `https://code-stream-api.onrender.com`)
   - `VITE_GITHUB_CLIENT_ID`: (Your GitHub Client ID)
6. Click **Deploy**.

---

## Part 3: GitHub OAuth Update

Go to [GitHub Developer Settings](https://github.com/settings/developers):
- Update **Homepage URL**: `https://your-frontend.vercel.app`
- Update **Authorization callback URL**: `https://your-frontend.vercel.app/login`

✅ Your CodeStream is now live!
