import mongoose from 'mongoose';

const investorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  name: { type: String, required: true },
  investorType: { type: String, required: true }, //? angel, VC, HNI
  investmentRangeMin: { type: Number, required: true },
  investmentRangeMax: { type: Number, required: true },
  preferredIndustries: { type: [String], required: true },
  interest: { type: String },
  location: { type: String }
}, { timestamps: true });

const Investor = mongoose.model("InvestorProfile", investorProfileSchema);

export default Investor;
