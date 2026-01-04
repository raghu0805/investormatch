import mongoose from 'mongoose';
 
const MessageSchema=new mongoose.Schema({
      roomId: { type: String, required: true }, // Links message to a specific chat
    senderId: { type: String, required: true }, // Who sent it?
    text: { type: String, required: true }      // The content
})

export default mongoose.model("Message",MessageSchema);