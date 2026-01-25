import Request from '../models/Request.js';
import Investor from "../models/InvestorProfile.js"
import Startup from "../models/StartupProfile.js"
import { generateRoomId } from "../utils/createRoom.js";


const sendStartupRequest = async (req, res) => {
  try {
    // Convert logged-in user → StartupProfile ID
    const startup = await Startup.findOne({ userId: req.userId });

    if (!startup) {
      return res.status(404).json({ message: "Startup profile not found" });
    }

    const startupId = startup._id;   // ✔ correct

    const { investorId } = req.body;

    if (!investorId || !startupId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const requestExist = await Request.findOne({ investorId, startupId });

    if (requestExist) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const roomId = generateRoomId(startupId, investorId);

    // Create request with correct startupId
    const created = await Request.create({
      investorId,
      startupId,
      roomId,
    });

    return res.status(201).json({ message: "Request created", data: created });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};





const sendInvestorRequest = async (req, res) => {
  try {
    // Convert logged-in user → InvestorProfile ID
    const investor = await Investor.findOne({ userId: req.userId });

    if (!investor) {
      return res.status(404).json({ message: "Startup profile not found" });
    }

    const investorId = investor._id;   // ✔ correct

    const { startupId } = req.body;

    if (!investorId || !startupId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const requestExist = await Request.findOne({ investorId, startupId });

    if (requestExist) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const roomId = generateRoomId(startupId, investorId);
    // Create request with correct startupId
    const created = await Request.create({
      investorId,
      startupId,
      roomId,
    });
    return res.status(201).json({ message: "Request created", data: created });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
const getSentRequests = async (req, res) => {
  try {
    // 1️⃣ Find the startup profile using logged-in userId
    const startup = await Startup.findOne({ userId: req.userId });

    if (!startup) {
      return res.status(404).json({ message: "Startup profile not found" });
    }

    const startupId = startup._id;
    // console.log("startup id from getSentRequest:", startupId.toString());

    // 2️⃣ Use StartupProfile._id in the query
    const sent = await Request.find({ startupId }).populate("investorId");

    // console.log("sent requests:", sent);

    return res
      .status(200)
      .json({ message: "The sent requests fetched", data: sent });
  } catch (err) {
    console.error("Error in getSentRequests:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
const getReceivedRequests = async (req, res) => {
  try {
    // Step 1: Get InvestorProfile from logged-in userId
    const investor = await Investor.findOne({ userId: req.userId });

    if (!investor) {
      return res.status(404).json({ message: "Investor profile not found" });
    }

    // console.log("Correct investorId:", investor._id);

    // Step 2: Use investor._id to fetch requests
    const received = await Request.find({ investorId: investor._id })
      .populate("startupId");

    // console.log("details:", received);

    return res.status(200).json({
      message: "Received requests fetched",
      data: received,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};



const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    // 1. Get IO instance
    const io = req.app.get("io");
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    // 2. Find and update the request
    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );
    if (!updated) {
        return res.status(404).json({ message: "Request not found" });
    }
    // 3. Notify the OTHER party
    // The 'updated' object contains investorId and startupId (Profile IDs)
    // We need to find the User ID of the party who SHOULD RECEIVE the notification.
    
    // Logic: If the current user is the Startup, notify the Investor.
    // If the current user is the Investor, notify the Startup.
    // Since we don't easily know who "sent" the action here without querying, 
    // we can simply emit to BOTH parties or check the current user.
    
    // Robust approach: Fetch both profiles to get their UserIDs
    const startupProfile = await Startup.findById(updated.startupId);
    const investorProfile = await Investor.findById(updated.investorId);
    if (startupProfile && startupProfile.userId) {
        io.to(startupProfile.userId.toString()).emit("request-status-updated", updated);
    }
    
    if (investorProfile && investorProfile.userId) {
        io.to(investorProfile.userId.toString()).emit("request-status-updated", updated);
    }
    return res.status(200).json({ message: "Request updated", data: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
const checkingAlreadySent=async(req,res)=>{
  try{
    const startupId=req.userId;
const investorId = req.query.investorId;   
    const requestExist = await Request.findOne({ investorId, startupId });
    if(requestExist){
      return res.status(400).json({message:"The request is already sent"})
    }
    return res.status(200).json({message:"The request is not sent"});
  }
  catch(err){
       return res.status(500).json({ message: "Server error" });
  }
}

//it is for sending request from investor to stattup
const checkingInvestorAlreadySent=async(req,res)=>{
  try{
    const investorId=req.userId;
const startupId = req.query.startupId;   
    const requestExist = await Request.findOne({ investorId, startupId });
    if(requestExist){
      return res.status(400).json({message:"The request is already sent"})
    }
    return res.status(200).json({message:"The request is not sent"});
  }
  catch(err){
       return res.status(500).json({ message: "Server error" });
  }
}
export { sendStartupRequest,sendInvestorRequest,getSentRequests,getReceivedRequests,updateRequestStatus,checkingAlreadySent,checkingInvestorAlreadySent };

