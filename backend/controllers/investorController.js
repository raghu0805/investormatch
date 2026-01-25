import Investor from '../models/InvestorProfile.js';
import StartupProfile from '../models/StartupProfile.js';
import Request from '../models/Request.js';
import { cosineSimilarity } from '../utils/cosineSimilarity.js';
import { generateEmbedding } from "../utils/generateEmbeddings.js";


const matchStartup = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Get investor with embedding
    const investor = await Investor.findOne({
      userId,
      embeddingStatus: "completed"
    });

    if (!investor) {
      return res.status(400).json({
        message: "Startup embedding not ready"
      });
    }

    // 2️⃣ Fetch eligible investors
    const startup = await StartupProfile.find({
      embeddingStatus: "completed",
      // minimumInvestment: { $lte: startup.fundingNeeded },
      // maximumInvestment: { $gte: startup.fundingNeeded }
    });

    // 3️⃣ FETCH ALL REQUESTS involving this investor (Sent OR Received)
    const allRequests = await Request.find({ investorId: investor._id });

    // Create a Map: startupId -> { status, requestId }
    const requestStatusMap = new Map();
    allRequests.forEach(req => {
      requestStatusMap.set(req.startupId.toString(), { status: req.status, requestId: req._id });
    });

    // 4️⃣ Rank using cosine similarity AND add request status
    const rankedstartup = startup.map(stp => {
      const requestInfo = requestStatusMap.get(stp._id.toString());
      return {
        ...stp.toObject(),
        similarity: cosineSimilarity(stp.embedding, investor.embedding),
        requestStatus: requestInfo ? requestInfo.status : null,
        requestId: requestInfo ? requestInfo.requestId : null
      }
    });

    // 5️⃣ Sort DESC
    rankedstartup.sort((a, b) => b.similarity - a.similarity);
    // 6️⃣ Return top N (3)
    return res.status(200).json({
      investorId: investor.userId,
      matches: rankedstartup.slice(0, 3)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};



function buildInvestorEmbeddingText(investor) {
  return `
Investor Type: ${investor.investorType}
Risk Level: ${investor.riskLevel}
Preferred Industries: ${(investor.preferredIndustries || []).join(", ")}
Investment Interest: ${investor.investmentInterest || ""}
Description: ${investor.description || ""}
Location: ${investor.location}
`.trim();
}


const createInvestorProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      investorName,
      investorType,
      location,
      minimumInvestment,
      maximumInvestment,
      riskLevel,
      preferredIndustries,
      investmentInterest,
      description,
      websiteURL
    } = req.body;

    // required fields validation
    if (!investorName || !investorType || !location || !riskLevel) {
      return res.status(400).json({
        success: false,
        message: "Required fields: investorName, investorType, location, riskLevel"
      });
    }

    // check existing profile
    const existingInvestor = await Investor.findOne({ userId });
    if (existingInvestor) {
      return res.status(409).json({
        success: false,
        message: "Investor profile already exists"
      });
    }

    // 1️⃣ Create investor profile FIRST
    const newInvestor = await Investor.create({
      userId,
      investorName,
      investorType,
      location,
      minimumInvestment: Number(minimumInvestment),
      maximumInvestment: Number(maximumInvestment),
      riskLevel,
      preferredIndustries,
      investmentInterest,
      description,
      websiteURL,
      embeddingStatus: "pending"
    });

    // 2️⃣ Generate embedding safely (NON-BLOCKING)
    try {
      const text = buildInvestorEmbeddingText(newInvestor);
      const embedding = await generateEmbedding(text);

      newInvestor.embedding = embedding;
      newInvestor.embeddingStatus = "completed";
      await newInvestor.save();

    } catch (embeddingError) {
      console.error("Investor embedding failed:", embeddingError.message);
      // profile remains valid even if embedding fails
    }

    return res.status(201).json({
      success: true,
      message: "Investor profile created successfully",
      data: newInvestor
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getMyInvestorProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const investorProfile = await Investor.findOne({ userId });
    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        message: "Investor profile not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Investor profile fetched successfully",
      data: investorProfile
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateInvestorProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const investorProfile = await Investor.findOne({ userId });
    if (!investorProfile) {
      return res.status(404).json({
        success: false,
        message: "Investor profile not found"
      });
    }

    const allowedFields = [
      "investorName",
      "investorType",
      "location",
      "minimumInvestment",
      "maximumInvestment",
      "riskLevel",
      "preferredIndustries",
      "investmentInterest",
      "description",
      "websiteURL"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Convert number fields
        if (field === "minimumInvestment" || field === "maximumInvestment") {
          investorProfile[field] = Number(req.body[field]);
        } else {
          investorProfile[field] = req.body[field];
        }
      }
    });

    await investorProfile.save();

    return res.status(200).json({
      success: true,
      message: "Investor profile updated successfully",
      data: investorProfile
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const getInvestorProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Investor.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Investor profile not found" });
    }

    return res.status(200).json({ success: true, profile });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  createInvestorProfile, getMyInvestorProfile, updateInvestorProfile, getInvestorProfileById, matchStartup
};