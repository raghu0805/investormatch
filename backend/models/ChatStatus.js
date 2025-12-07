import mongoose from "mongoose";

const chatStatusSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    roomId: { type: String, required: true },
    lastSeen: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("ChatStatus", chatStatusSchema);
