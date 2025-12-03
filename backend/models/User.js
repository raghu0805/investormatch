import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String }, // NOT required
  picture: String,
  role: {
    type: String,
    enum: ["startup", "investor"],
    required: true,
  },
  googleUser: {
    type: Boolean,
    default: false,
  }
});

const User = mongoose.model('User', userSchema);
export default User;
