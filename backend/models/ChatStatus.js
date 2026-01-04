import mongoose from "mongoose";
const chatStatusSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userId: { type: String, required: true },
  lastSeen: { type: Date, default: Date.now } // The last time they opened this chat
});
export default mongoose.model("ChatStatus", chatStatusSchema);