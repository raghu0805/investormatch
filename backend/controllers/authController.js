import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper function to sign JWT tokens uniformly
const createToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || 'DEFAULT_INVESTMATCH_SECRET',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Format user payload consistently
const formatUser = (user) => ({
  id: user._id,
  _id: user._id,
  email: user.email,
  role: user.role,
  name: user.name || '',
  picture: user.picture || null,
  googleUser: Boolean(user.googleUser)
});

const signup = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: "Email, password, and role are required" });
    }

    if (!["student", "startup", "investor"].includes(role)) {
      return res.status(400).json({ success: false, error: "Role must be either 'student' or 'investor'" });
    }

    // Email normalization
    const normalizedEmail = email.toLowerCase().trim();

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "An account with this email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role,
      name: name ? name.trim() : '',
      googleUser: false,
    });

    const token = createToken(newUser._id, newUser.email, newUser.role);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: formatUser(newUser)
    });

  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ success: false, error: "Server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Check if account was registered exclusively via Google OAuth without a password
    if (existingUser.googleUser && !existingUser.password) {
      return res.status(400).json({
        success: false,
        error: "This account was registered using Google OAuth. Please sign in with Google."
      });
    }

    if (!existingUser.password) {
      return res.status(400).json({
        success: false,
        error: "No password configured for this account. Please sign in using Google."
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const token = createToken(existingUser._id, existingUser.email, existingUser.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: formatUser(existingUser)
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, error: "Server error during login" });
  }
};

const GoogleLogin = async (req, res) => {
  try {
    const { mode, email, name, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required", message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (mode === "login") {
      if (!user) {
        return res.status(404).json({ success: false, error: "User not registered. Please sign up first.", message: "User not registered. Please sign up first." });
      }

      return res.status(200).json({
        success: true,
        message: "Google login successful",
        token: createToken(user._id, user.email, user.role),
        user: formatUser(user)
      });
    }

    if (mode === "signup") {
      if (user) {
        return res.status(200).json({
          success: true,
          alreadyExists: true,
          message: "Welcome back! Account already exists.",
          token: createToken(user._id, user.email, user.role),
          user: formatUser(user)
        });
      }
      return res.status(200).json({
        success: true,
        signupAllowed: true,
        email: normalizedEmail,
        name,
        picture
      });
    }

    // Default fallback if mode is not specified
    if (user) {
      return res.status(200).json({
        success: true,
        message: "Google authentication successful",
        token: createToken(user._id, user.email, user.role),
        user: formatUser(user)
      });
    }

    return res.status(200).json({
      success: true,
      signupAllowed: true,
      email: normalizedEmail,
      name,
      picture
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ success: false, error: "Server error during Google authentication", message: "Server error during Google authentication" });
  }
};

const RegisterRole = async (req, res) => {
  try {
    const { email, name, picture, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, error: "Email and role are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists. Please log in." });
    }

    const newUser = await User.create({
      email: normalizedEmail,
      name: name || '',
      picture: picture || null,
      role,
      googleUser: true,
      password: null,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      token: createToken(newUser._id, newUser.email, newUser.role),
      user: formatUser(newUser),
    });
  } catch (error) {
    console.error("RegisterRole Error:", error);
    return res.status(500).json({ success: false, error: "Server error during role registration" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.status(200).json({
      success: true,
      user: formatUser(user)
    });
  } catch (error) {
    console.error("getMe Error:", error);
    return res.status(500).json({ success: false, error: "Server error fetching user profile" });
  }
};

export { signup, login, GoogleLogin, RegisterRole, getMe };
