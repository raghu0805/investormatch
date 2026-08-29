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

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

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
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for development ease
  },
  credentials: true
};

// Middlewares
app.use(cors(corsOptions));
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