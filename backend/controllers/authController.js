import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    //? Email normalization
    const normalizedemail = email.toLowerCase().trim();

    //? Password validation
    if (password.length < 8) {
      res.status(400).json({ error: "Password should be at least 8 characters" });
      return;
    }

    //? Check existing user
    const existuser = await User.findOne({ email: normalizedemail });
    if (existuser) {
      res.status(400).json({ error: "The user already exists!" });
      return;
    }

    //? Hash password
    const salt = await bcrypt.genSalt(10);     
    const hashedpassword = await bcrypt.hash(password, salt); 
    console.log("hashed password:", hashedpassword, password);

    //? Create new user
    const newUser = await User.create({
      email: normalizedemail,
      password: hashedpassword,
      role
    });

    //? Send response
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};




const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //? Check required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    //? Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    //? Find user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      return res.status(404).json({ error: "Invalid details" });
    }

    //? Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid details" });
    }

    const token=jwt.sign({
      id:existingUser._id,
      email:existingUser.email
    },process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});

    //? Success
    return res.status(200).json({
      message: "User login successful",
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
export { signup,login };
