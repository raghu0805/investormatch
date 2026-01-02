import Startup from '../models/StartupProfile.js';
import Investor from '../models/InvestorProfile.js';
import { cosineSimilarity } from "../utils/cosineSimilarity.js";
import { generateEmbedding } from "../utils/generateEmbeddings.js";

const matchInvestors = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ Get startup with embedding
    const startup = await Startup.findOne({
      userId,
      embeddingStatus: "completed"
    });

    if (!startup) {
      return res.status(400).json({
        message: "Startup embedding not ready"
      });
    }

    // 2️⃣ Fetch eligible investors
    const investors = await Investor.find({
      embeddingStatus: "completed",
      minimumInvestment: { $lte: startup.fundingNeeded },
      maximumInvestment: { $gte: startup.fundingNeeded }
    });

    // 3️⃣ Rank using cosine similarity
    const rankedInvestors = investors.map(inv => ({
      ...inv.toObject(),
      similarity: cosineSimilarity(startup.embedding, inv.embedding)
    }));

    // 4️⃣ Sort DESC
    rankedInvestors.sort((a, b) => b.similarity - a.similarity);

    // 5️⃣ Return top N (3)
    return res.status(200).json({
      startupId: startup._id,
      matches: rankedInvestors.slice(0, 3)
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export default matchInvestors;
function buildStartupEmbeddingText(startup) {
  return `
Industry: ${startup.industry}
Stage: ${startup.stage}
Problem: ${startup.problemStatement}
Solution: ${startup.solution}
Description: ${startup.description || ""}
Location: ${startup.location}
`.trim();
}

const createStartupProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const { 
      startupName, 
      founderName, 
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

    // required fields validation
    if (!startupName || !founderName || !industry || !problemStatement || !solution || !stage || !fundingNeeded || !location) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // stage validation
    const allowedStages = ["idea", "prototype", "MVP", "Scale"];
    if (!allowedStages.includes(stage)) {
      return res.status(400).json({ error: "Startup stage is not allowed/invalid!" });
    }

    // check if profile already exists
    const existingProfile = await Startup.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ error: "Startup profile already exists" });
    }

    // 1️⃣ Create profile FIRST
    const newStartupProfile = await Startup.create({
      userId,
      startupName,
      founderName,
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
      const text = buildStartupEmbeddingText(newStartupProfile);
      const embedding = await generateEmbedding(text);

      newStartupProfile.embedding = embedding;
      newStartupProfile.embeddingStatus = "completed";
      await newStartupProfile.save();

    } catch (embeddingError) {
      console.error("Embedding generation failed:", embeddingError);
      // profile still exists – safe fallback
    }

    return res.status(201).json({
      message: "Startup profile created successfully",
      profile: newStartupProfile
    });

  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Profile already exists" });
    }

    return res.status(500).json({ error: "Server Error" });
  }
};




const getMyStartupProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await Startup.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: "Startup profile doesn't exist" });
    }

    return res.status(200).json({
      success: true,
      message: "Startup profile fetched successfully",
      profile
    });

  } catch (err) {
    console.error("Error fetching startup profile:", err);
    return res.status(500).json({ error: "Server Error" });
  }
};

const updateStartupProfile=async(req,res)=>{
  try{

  
  const userId=req.userId;
  const profile=await Startup.findOne({userId});
  if(!profile){
    return res.status(404).json({error:"The profile not found"});
  }    
  const allowed = [
      "startupName",
      "founderName",
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
  allowed.forEach((field)=>{
    if(req.body[field]!==undefined){
      profile[field]=req.body[field];
    }
  })
  await profile.save();

  return res.status(201).json({message:"profile updated successfully",profile});
}catch(err){
  return res.status(500).json({error:"Server error"});
}
}






const calculateScore = (investor, startup) => {
  let score = 0;

 
  if (investor.location.toLowerCase() === startup.location.toLowerCase()) {
    score += 20;
  }

 
  if (investor.preferredIndustries.includes(startup.industry)) {
    score += 40;
  }

  
  if (
    investor.minimumInvestment <= startup.fundingNeeded &&
    investor.maximumInvestment >= startup.fundingNeeded
  ) {
    score += 30;
  }

    
  if (
    investor.investmentInterest &&
    investor.investmentInterest.toLowerCase().includes(startup.stage.toLowerCase())
  ) {
    score += 10;
  }

  return score;
};

export {createStartupProfile,getMyStartupProfile,updateStartupProfile,matchInvestors};
