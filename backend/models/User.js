import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // removes spaces like " Raghu  "
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // normalize email
  },

  password: {
    type: String, 
    // Not required because Google login users won’t have a password
  },

  picture: {
    type: String, // profile photo URL
    default: null,
  },

  role: {
    type: String,
    enum: ["startup", "investor"],
    required: true,
  },

  googleUser: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
