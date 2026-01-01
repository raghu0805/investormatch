import mongoose from "mongoose";

const investorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    investorName: { type: String, required: true },

    investorType: {
      type: String,
      enum: ["angel", "vc", "hni"],
      required: true,
    },

    location: { type: String, required: true },

    minimumInvestment: { type: Number, required: true },
    maximumInvestment: { type: Number, required: true },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    preferredIndustries: { type: [String], required: true },

    investmentInterest: { type: String, required: true },

    description: { type: String },

    websiteURL: { type: String },

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

const InvestorProfile = mongoose.model(
  "InvestorProfile",
  investorProfileSchema
);

export default InvestorProfile;
