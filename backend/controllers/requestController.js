import Request from '../models/Request.js';
const sendRequest = async (req, res) => {
    try {
      const startupId=req.userId;
        const { investorId } = req.body;
        if (!investorId || !startupId) {
            return res.status(400).json({ message: "investorId  are required!" });
        }
        const requestExist = await Request.findOne({ investorId, startupId });
        if (requestExist) {
            return res.status(400).json({ message: "The request is already exist" });
        }
        const createRequest = await Request.create({ investorId, startupId });
        return res.status(201).json({ message: "Request created successfully", data: createRequest });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error" })
    }
}

const getSentRequests = async (req, res) => {
    try {
      const startupId=req.userId;

        const sent = await Request.findOne({ startupId }).populate("investorId");
        return res.status(200).json({ message: "the sent request fetched ", data: sent });
    } catch (err) {
        return res.status(500).json({ message: "Server Error" });

    }
}
const getReceivedRequests = async (req, res) => {
  try {
         const  investorId  = req.userId;

    const received = await Request.find({ investorId })
      .populate("startupId");

    return res.status(200).json({ message: "Received requests fetched", data: received });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    return res.status(200).json({ message: "Request updated", data: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
const checkingAlreadySent=async()=>{
  try{
    const startupId=req.userId;
    const {investorId}=req.body;
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
export { sendRequest,getSentRequests,getReceivedRequests,updateRequestStatus,checkingAlreadySent };

