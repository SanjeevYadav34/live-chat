# Live Chat Rooms — Ready-to-Deploy

This repository contains a simple room-based realtime chat app:
- Frontend: static site (HTML/CSS/JS)
- Backend: Node.js + Socket.io

## How it works
- Create a chat -> server generates a 6-letter uppercase room code and the creator joins the room.
- Join a chat -> enter the 6-letter code -> join the room and receive recent history.
- Messages are broadcast only to users inside the same room.

## Deploy Backend (Render)
1. Create account on Render.com (free tier).
2. Create a new **Web Service**.
3. Connect repo or upload `backend/` folder as code.
4. Set build & start:
   - Start Command: `npm start`
5. Set environment (Render installs dependencies automatically).
6. After deploy, note the public URL, e.g. `https://mychat-backend.onrender.com`.

## Deploy Frontend (Vercel)
1. Create account on Vercel.
2. Create a new project → import `frontend/` folder (or drag & drop static files).
3. Before deploy, open `frontend/script.js` and update `BACKEND_URL` with your backend URL (see top of file).
4. Deploy — Vercel will publish a frontend URL.

## Local Testing (quick)
1. On your PC install Node.js (v18 recommended).
2. Open terminal in `backend/` and run:
   ```
   npm install
   npm start
   ```
3. In `frontend/script.js` set:
   ```
   const BACKEND_URL = "http://localhost:5000";
   ```
4. Open `frontend/index.html` in your browser (or use a simple static server such as `npx serve frontend`).
5. Open the page in two browser tabs/devices, create a room in one, copy code into join input in the other -> chat live.

## Troubleshooting
- If you get CORS errors, ensure the backend is running with `cors()` enabled (it is by default here).
- If Socket.IO connection fails on deployed Render, verify the URL and that your frontend `BACKEND_URL` includes the correct protocol (https).

## Notes
- This project stores recent messages in memory (server restarts will clear history).
- For production grade app, consider adding authentication, persisting messages to a DB, rate-limiting, and scaling with multiple instances using Redis adapter for Socket.IO.
