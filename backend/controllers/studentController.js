import Student from '../models/StudentProfile.js';
import Investor from '../models/InvestorProfile.js';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { generateEmbedding } from "../utils/generateEmbeddings.js";

const matchInvestors = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Get student with embedding
    const student = await Student.findOne({
      userId,
      embeddingStatus: "completed"
    });

    if (!student) {
      return res.status(400).json({
        message: "Student embedding not ready"
      });
    }

    // 2️⃣ Fetch eligible investors
    const investors = await Investor.find({
      embeddingStatus: "completed",
      minimumInvestment: { $lte: student.fundingNeeded },
      maximumInvestment: { $gte: student.fundingNeeded }
    });

    // 3️⃣ Rank using cosine similarity
    const allRequests = await Request.find({
      $or: [{ studentId: student._id }, { startupId: student._id }]
    });
    const requestStatusMap = new Map();
    allRequests.forEach(req => {
      requestStatusMap.set(req.investorId.toString(), { status: req.status, requestId: req._id });
    });

    const rankedInvestors = investors.map(inv => {
      const requestInfo = requestStatusMap.get(inv._id.toString());
      return {
        ...inv.toObject(),
        similarity: cosineSimilarity(student.embedding, inv.embedding),
        requestStatus: requestInfo ? requestInfo.status : null,
        requestId: requestInfo ? requestInfo.requestId : null
      }
    });

    // 4️⃣ Sort DESC
    rankedInvestors.sort((a, b) => b.similarity - a.similarity);

    // 5️⃣ Return top N (3)
    return res.status(200).json({
      studentId: student._id,
      startupId: student._id,
      matches: rankedInvestors.slice(0, 3)
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

function buildStudentEmbeddingText(student) {
  return `
Name / Project: ${student.studentName || student.startupName || ""}
Industry: ${student.industry}
Stage: ${student.stage}
Problem: ${student.problemStatement}
Solution: ${student.solution}
Description: ${student.description || ""}
Location: ${student.location}
`.trim();
}

const createStudentProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      studentName,
      startupName,
      founderName,
      contactEmail,
      industry,
      problemStatement,
      solution,
      description,
      pitchDeckURL,
      teamSize,
      stage,
      fundingNeeded,
      location
    } = req.body;

    const displayName = studentName || startupName;

    // required fields validation
    if (!displayName || !founderName || !industry || !problemStatement || !solution || !stage || !fundingNeeded || !location) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // stage validation
    const allowedStages = ["idea", "prototype", "MVP", "Scale"];
    if (!allowedStages.includes(stage)) {
      return res.status(400).json({ error: "Student project stage is not allowed/invalid!" });
    }

    // check if profile already exists
    const existingProfile = await Student.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ error: "Student profile already exists" });
    }

    // Resolve default email from User model if not explicitly provided
    let finalContactEmail = contactEmail?.trim()?.toLowerCase();
    if (!finalContactEmail) {
      const user = await User.findById(userId);
      if (user && user.email) {
        finalContactEmail = user.email.toLowerCase();
      }
    }

    // 1️⃣ Create profile FIRST
    const newStudentProfile = await Student.create({
      userId,
      studentName: displayName,
      startupName: displayName,
      founderName,
      contactEmail: finalContactEmail,
      industry,
      problemStatement,
      solution,
      description,
      pitchDeckURL,
      teamSize,
      stage,
      fundingNeeded,
      location,
      embeddingStatus: "pending"
    });

    // 2️⃣ Generate embedding (NON-BLOCKING LOGIC)
    try {
      const text = buildStudentEmbeddingText(newStudentProfile);
      const embedding = await generateEmbedding(text);

      newStudentProfile.embedding = embedding;
      newStudentProfile.embeddingStatus = "completed";
      await newStudentProfile.save();

    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError);
    }

    return res.status(201).json({
      message: "Student profile created successfully",
      profile: newStudentProfile
    });

  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Profile already exists" });
    }

    return res.status(500).json({ error: "Server Error" });
  }
};

const getMyStudentProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await Student.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: "Student profile doesn't exist" });
    }

    return res.status(200).json({
      success: true,
      message: "Student profile fetched successfully",
      profile
    });

  } catch (err) {
    console.error("Error fetching student profile:", err);
    return res.status(500).json({ error: "Server Error" });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await Student.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "The profile not found" });
    }
    const allowed = [
      "studentName",
      "startupName",
      "founderName",
      "contactEmail",
      "industry",
      "problemStatement",
      "solution",
      "stage",
      "fundingNeeded",
      "location",
      "description",
      "pitchDeckURL",
      "teamSize"
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    if (req.body.studentName && !profile.startupName) {
      profile.startupName = req.body.studentName;
    } else if (req.body.startupName && !profile.studentName) {
      profile.studentName = req.body.startupName;
    }

    await profile.save();

    return res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

const getStudentProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Student.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    return res.status(200).json({ success: true, profile });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  createStudentProfile,
  getMyStudentProfile,
  updateStudentProfile,
  matchInvestors,
  getStudentProfileById
};
