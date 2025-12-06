import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },  // unique room for 2 users

    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true 
    },

    receiverId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    },

    message: { type: String, required: true },

    seen: { type: Boolean, default: false },
    messageType: {
  type: String,
  enum: ["text", "image", "file"],
  default: "text"
},
fileURL: { type: String },
reactions: [
  {
    emoji: String,
    userId: mongoose.Types.ObjectId
  }
]

  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
