import mongoose from "mongoose";

const startupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    startupName: { type: String, required: true },

    founderName: { type: String, required: true },

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

const StartupProfile = mongoose.model(
  "StartupProfile",
  startupSchema
);

export default StartupProfile;
