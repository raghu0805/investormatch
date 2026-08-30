import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

import { Server } from 'socket.io';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://investmatch.me",
  "https://www.investmatch.me",
  "https://investormatch-git-master-raghu0805s-projects.vercel.app"
];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
};

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"]
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Middlewares
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/startup", studentRoutes); // Fallback alias for legacy requests
app.use("/api/investor", investorRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/news", newsRoutes);


app.get("/api", (req, res) => {
  res.json({ success: true, message: "InvestMatch API is running" });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "InvestMatch Server is active" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});