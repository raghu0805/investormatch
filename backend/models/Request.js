import mongoose from "mongoose";
const requestSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupProfile",
      required: true,
    },
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InvestorProfile",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    senderRole: {
      type: String,
      enum: ["startup", "investor"],
      required: true
    },

    roomId: {
      type: String,
      default: null,
    },
    blocked: {
      type: Boolean,
      default: false
    },
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,  // user who blocked
      ref: "User",
      default: null
    },
  },
  { timestamps: true }
);
const Request = mongoose.model("Request", requestSchema);
export default Request;