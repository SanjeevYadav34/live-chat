import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"], credentials: true }
});

// In-memory store for message history per room (keeps only last 50 messages)
const roomHistory = new Map();

function generateRoomCode(){
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
  return code;
}

// simple status route
app.get("/", (req, res) => {
  res.send({ status: "ok", msg: "Live Chat Backend running." });
});

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("createRoom", () => {
    let code = generateRoomCode();
    // avoid collision (simple retry)
    while (io.sockets.adapter.rooms.has(code)) code = generateRoomCode();
    socket.join(code);
    // initialize history
    roomHistory.set(code, []);
    socket.emit("roomCreated", code);
  });

  socket.on("joinRoom", (data) => {
    try {
      const { roomCode, username } = data;
      if (!roomCode || typeof roomCode !== "string") { socket.emit("errorMsg", "Invalid room code."); return; }
      const rooms = io.sockets.adapter.rooms;
      if (rooms.has(roomCode)) {
        socket.join(roomCode);
        // send join confirmation with recent history
        const history = roomHistory.get(roomCode) || [];
        socket.emit("joinedRoom", { roomCode, history });
        socket.to(roomCode).emit("notification", (username || "Someone") + " joined the room.");
      } else {
        socket.emit("errorMsg", "Room not found.");
      }
    } catch (e) {
      console.error("joinRoom error", e);
      socket.emit("errorMsg", "Server error while joining.");
    }
  });

  socket.on("leaveRoom", (roomCode) => {
    if (!roomCode) return;
    socket.leave(roomCode);
    socket.to(roomCode).emit("notification", "A user left the room.");
  });

  socket.on("sendMessage", (payload) => {
    try {
      const { roomCode, username, text, ts } = payload;
      if (!roomCode || !text) return;
      // broadcast to room
      socket.to(roomCode).emit("receiveMessage", { username, text, ts });
      // save history
      const h = roomHistory.get(roomCode) || [];
      h.push((username ? ("<strong>"+username+"</strong>: ") : "") + text);
      if (h.length > 50) h.shift();
      roomHistory.set(roomCode, h);
    } catch (e) { console.error("sendMessage error", e); }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
