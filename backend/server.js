import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import connectDB from './config/db.js';
import requestRoutes from "./routes/requestRoutes.js";
import http from 'http';
import { Server } from 'socket.io';
import messageRoutes from './routes/messageRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import SocketHandler from './socket/socketHandler.js';
dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ["http://localhost:5173", "https://investmatch.me", "https://www.investmatch.me"] }
})
//make accessible to global.
app.set("io", io);
SocketHandler(io);
// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://investmatch.me",
    "https://www.investmatch.me",
  ],
  credentials: true
}));
app.use(express.json());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/startup", startupRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
  res.json({ message: "get route" });
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});