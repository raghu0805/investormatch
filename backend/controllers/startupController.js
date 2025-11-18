import Startup from '../models/StartupProfile.js';
import Investor from '../models/InvestorProfile.js';
const createStartupProfile = async (req, res) => {
    try {
        // userId should come from JWT, not req.body
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

        // create profile
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
            location
        });

        return res.status(201).json({
            message: "Startup profile created successfully",
            profile: newStartupProfile
        });

    } catch (err) {
        console.error(err);

        // handle duplicate key error
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



const matchInvestors = async (req, res) => {
  try {
    const userId = req.userId;


    const startup = await Startup.findOne({ userId });
    if (!startup) {
      return res.status(404).json({ message: "Startup profile not found" });
    }

   
    const investors = await Investor.find({});

    let maximumScore = 0;
    let topInvestor = null;

    investors.forEach((investor) => {
      const score = calculateScore(investor, startup);

      if (score >= maximumScore) {
        maximumScore = score;
        topInvestor = investor;
      }
    });

    return res.status(200).json({
      startup,
      topInvestor,
      maximumScore
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};


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
