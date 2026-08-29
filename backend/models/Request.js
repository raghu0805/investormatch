import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
    },
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
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
      enum: ["student", "startup", "investor"],
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

// Pre-save hook to ensure studentId/startupId sync
requestSchema.pre("save", function(next) {
  if (this.studentId && !this.startupId) {
    this.startupId = this.studentId;
  } else if (this.startupId && !this.studentId) {
    this.studentId = this.startupId;
  }
  next();
});

const Request = mongoose.model("Request", requestSchema);
export default Request;