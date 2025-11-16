import express from 'express';
import dotenv from 'dotenv';
import User from "./models/User.js";
import auth from './middleware/authMiddleware.js'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js';
dotenv.config();
import connectDB from './config/db.js';
connectDB();
const app=express();
const PORT=process.env.PORT||5000;

//?middleware
app.use(cors())
app.use(express.json());

//?auth routes

app.use("/api/auth",authRoutes)

//?protected routes by jwt 
app.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); //?to hide the pass
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})