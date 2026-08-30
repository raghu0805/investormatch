import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    studentName: { type: String },
    startupName: { type: String }, // Backwards compatibility & alias

    founderName: { type: String },
    contactEmail: { type: String, trim: true, lowercase: true },

    industry: { type: String, required: true },

    location: { type: String, required: true },

    problemStatement: { type: String, required: true },

    solution: { type: String, required: true },

    description: { type: String },

    pitchDeckURL: { type: String },

    teamSize: { type: Number },

    stage: {
      type: String,
      enum: ["idea", "prototype", "MVP", "Scale"],
      required: true,
    },

    fundingNeeded: { type: Number, required: true },

    // 🔑 Embedding field
    embedding: {
      type: [Number],
      default: []
    },
    embeddingStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model(
  "StudentProfile",
  studentSchema
);

export default StudentProfile;
