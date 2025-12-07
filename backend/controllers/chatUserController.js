import Request from "../models/Request.js";
import Startup from "../models/StartupProfile.js";
import Investor from "../models/InvestorProfile.js";
import User from "../models/User.js";

export const getChatUsers = async (req, res) => {
  try {
    const loggedInUserId = req.userId;

    const me = await User.findById(loggedInUserId);
    const isStartup = me.role === "startup";

    const convertProfileToUser = (profile, roleLabel, subtitle) => {
      if (!profile || !profile.userId) return null;

      return {
        _id: profile.userId._id,
        name: roleLabel === "startup" ? profile.startupName : profile.investorName,
        role: roleLabel,
        subtitle,
      };
    };

    // ------------------------
    // ACCEPTED USERS
    // ------------------------

    const acceptedRequests = await Request.find({
      status: "accepted",
    })
      .populate("startupId")
      .populate("investorId");

    const accepted = [];

    for (const reqDoc of acceptedRequests) {
      const startupProfile = await Startup.findById(reqDoc.startupId).populate("userId");
      const investorProfile = await Investor.findById(reqDoc.investorId).populate("userId");

      if (!startupProfile || !investorProfile) continue;

      if (String(startupProfile.userId?._id) === loggedInUserId) {
        const userObj = convertProfileToUser(investorProfile, "investor", "Accepted request");
        if (userObj) accepted.push(userObj);
      }

      if (String(investorProfile.userId?._id) === loggedInUserId) {
        const userObj = convertProfileToUser(startupProfile, "startup", "Accepted request");
        if (userObj) accepted.push(userObj);
      }
    }

    // ------------------------
    // SENT (pending requests)
    // ------------------------

    const sent = [];

    if (isStartup) {
      const pending = await Request.find({ status: "pending" }).populate("investorId");

      for (const reqDoc of pending) {
        const investorProfile = await Investor.findById(reqDoc.investorId).populate("userId");
        if (!investorProfile) continue;

        const userObj = convertProfileToUser(investorProfile, "investor", "Request sent");
        if (userObj) sent.push(userObj);
      }
    } else {
      const pending = await Request.find({ status: "pending" }).populate("startupId");

      for (const reqDoc of pending) {
        const startupProfile = await Startup.findById(reqDoc.startupId).populate("userId");
        if (!startupProfile) continue;

        const userObj = convertProfileToUser(startupProfile, "startup", "Request received");
        if (userObj) sent.push(userObj);
      }
    }

    // ------------------------
    // SAME INTEREST
    // ------------------------

    const interest = [];

    if (isStartup) {
      const myStartup = await Startup.findOne({ userId: loggedInUserId });
      if (myStartup) {
        const investors = await Investor.find({
          preferredIndustries: myStartup.industry,
        }).populate("userId");

        for (const inv of investors) {
          if (!inv?.userId) continue;
          if (String(inv.userId._id) === loggedInUserId) continue;

          const userObj = convertProfileToUser(inv, "investor", "Similar interest");
          if (userObj) interest.push(userObj);
        }
      }
    } else {
      const myInvestor = await Investor.findOne({ userId: loggedInUserId });
      if (myInvestor) {
        const startups = await Startup.find({
          industry: { $in: myInvestor.preferredIndustries },
        }).populate("userId");

        for (const st of startups) {
          if (!st?.userId) continue;
          if (String(st.userId._id) === loggedInUserId) continue;

          const userObj = convertProfileToUser(st, "startup", "Similar interest");
          if (userObj) interest.push(userObj);
        }
      }
    }

    return res.json({ accepted, sent, interest });
  } catch (err) {
    console.error("Error in getChatUsers:", err);
    return res.status(500).json({ message: "Error fetching chat users" });
  }
};
