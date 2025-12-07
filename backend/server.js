import express from 'express';
import dotenv from 'dotenv';
import User from "./models/User.js";
import auth from './middleware/authMiddleware.js'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import connectDB from './config/db.js';
import "./crons/deleteOldMessages.js";
import socketHandler from './socket/socketHandler.js';
import requestRoutes from "./routes/requestRoutes.js";

import http from "http";
import { Server } from "socket.io";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/startup", startupRoutes);
app.use("/api/investor", investorRoutes);

app.use("/api/request", requestRoutes);
app.use("/api/messages", messageRoutes);

app.use("/api/chat",chatRoutes);

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "get route" });
});

// Create HTTP server
const server = http.createServer(app);

// SOCKET.IO FIXED CONFIG
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket connection
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // socket.on("join-room",roomId=>{
  //   console.log("User joined room:",roomId);
  //   socket.join(roomId);
  // })
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});
socketHandler(io);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

