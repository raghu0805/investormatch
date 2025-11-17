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
    investmentInterest: { type: String, required: true }, // your “interest” renamed
    description: { type: String },
    websiteURL: { type: String }
  },
  { timestamps: true }
);
const Investor = mongoose.model("InvestorProfile", investorProfileSchema);
export default Investor;