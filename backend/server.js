import express from 'express';
import dotenv from 'dotenv';
import User from "./models/User.js";
import auth from './middleware/authMiddleware.js'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import connectDB from './config/db.js';
import socketHandler from './socket/socketHandler.js';
import messageRoutes from "./routes/messageRoutes.js"
import chatRoutes from "./routes/chatRoutes.js";



import "./crons/deleteOldMessages.js";

//?socket.io imports
import http from "http";
import {Server} from "socket.io";

const app=express();
dotenv.config();
const PORT=process.env.PORT||5000;

connectDB();
//?middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

//?auth routes

app.use("/api/auth",authRoutes)

//?startup routes
app.use("/api/startup",startupRoutes);

//?investor routes
app.use("/api/investor",investorRoutes);

app.use("/api/messages",messageRoutes)
app.use("/uploads", express.static("uploads"));

//?Request routes.
import requestRoutes from "./routes/requestRoutes.js";
app.use("/api/request", requestRoutes);


//?protected routes by jwt 
app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); //?to hide the pass
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});



app.use("/api/chats",chatRoutes)

app.get("/",(req,res)=>{
  res.json({message:"get route"})
})


//?--socket.io setup---??
const server=http.createServer(app);

const io=new Server(server,{
  cors:{
    oriigin:"http://localhsot:5173",
    methods:["GET","POST"],
    credentials:true
  }});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

socketHandler(io);
export {io};
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})