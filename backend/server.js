import express from 'express';
import dotenv from 'dotenv';
import User from "./models/User.js";
import auth from './middleware/authMiddleware.js'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js';
import startupRoutes from './routes/startupRoutes.js';
import investorRoutes from './routes/investorRoutes.js';
import connectDB from './config/db.js';
const app=express();
dotenv.config();
const PORT=process.env.PORT||5000;

connectDB();
//?middleware
app.use(cors())
app.use(express.json());

//?auth routes

app.use("/api/auth",authRoutes)

//?startup routes
app.use("/api/startup",startupRoutes);

//?investor routes
app.use("/api/investor",investorRoutes);

//?protected routes by jwt 
app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); //?to hide the pass
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})