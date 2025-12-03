import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });

    }

    //? Email normalization
    const normalizedemail = email.toLowerCase().trim();

    //? Password validation
    if (password.length < 8) {
      return res.status(400).json({ error: "Password should be at least 8 characters" });

    }

    //? Check existing user
    const existuser = await User.findOne({ email: normalizedemail });
    if (existuser) {
      return res.status(400).json({ error: "The user already exists!" });

    }

    //? Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    console.log("hashed password:", hashedpassword, password);

    //? Create new user
    const newUser = await User.create({
      email: normalizedemail,
      password: hashedpassword,
      role,
      googleUser: false,
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

    const token = jwt.sign({
      id: existingUser._id,
      email: existingUser.email
    }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

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


const GoogleLogin=async (req,res)=>{
  const{mode,email,name,picture}=req.body;
  const user=await User.findOne({email});
  if (mode=="login"){
    if(!user){
      return res.status(400).json({message:"User not registered"});
    }
    return res.status(200).json({
      message:"Login success",
      user,
      token:createToken(user._id,user.role)
    })
  }
  if(mode=="signup"){
    if(user){
      return res.status(400).json({message:"Already registered"});
    }
    return res.json({signupAllowed:true,email,name,picture});
  }
}
//?helper function
const createToken = (userId, role) => {
   return jwt.sign(
      { id: userId, role: role },
      process.env.JWT_SECRET,
      { expiresIn:process.env.JWT_EXPIRES_IN }
   );
};
const RegisterRole= async (req, res) => {
    const { email, name, picture, role } = req.body;

const newUser = await User.create({
  email,
  name,
  picture,
  role,
  googleUser: true,
  password: null,
});


    return res.json({
        message: "Signup success",
        token: createToken(newUser._id, newUser.role),
        user: newUser,
    });
};

export { signup, login,GoogleLogin,RegisterRole };
