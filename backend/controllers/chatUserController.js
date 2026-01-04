import User from "../models/User.js";
import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";
import Request from "../models/Request.js";

export const getChatUsers = async (req, res) => {
    try {
        const loggedUserId = req.userId;
        const user = await User.findOne({ _id: loggedUserId });
        console.log(user);
        const isStartup = user.role === 'startup';
        //1.Find the user startup or investor and fetch their profile
        let myProfile;
        if (isStartup) {
            myProfile = await StartupProfile.findOne({ userId: loggedUserId });
        } else {
            myProfile = await InvestorProfile.findOne({ userId: loggedUserId });
        }

        if (!myProfile) {
            console.log("No profile found for user:", loggedUserId);
            return res.json({ accepted: [] });
        }

        const query = { status: "accepted" };
        if (isStartup) {
            query.startupId = myProfile._id;
        } else {
            query.investorId = myProfile._id;
        }
        console.log("Searching Requests with Query:", query);

        const requests = await Request.find(query)
            .populate("startupId")
            .populate("investorId");
        console.log("Found Requests:", requests.length);

        const chatUsers = []
        for (const req of requests) {
            let otherProfile;
            if (isStartup) {
                otherProfile = req.investorId;
            } else {
                otherProfile = req.startupId;
            }
            chatUsers.push({
                requestId: req._id,
                name: isStartup ? otherProfile.investorName : otherProfile.startupName,
                otherId: otherProfile._id
            });
        }

        console.log("Sending Chat Users:", chatUsers);
        return res.json({ accepted: chatUsers });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ message: "Error loading chat users" });

    }
}