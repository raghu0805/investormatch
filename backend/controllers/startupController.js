import Startup from '../models/StartupProfile.js';

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
export {createStartupProfile,getMyStartupProfile,updateStartupProfile};