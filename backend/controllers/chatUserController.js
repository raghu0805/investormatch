import Request from "../models/Request.js";
import Startup from "../models/StartupProfile.js";
import Investor from "../models/InvestorProfile.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import ChatStatus from "../models/ChatStatus.js";

export const getChatUsers = async (req, res) => {
  try {
    const loggedInUserId = req.userId;

    const me = await User.findById(loggedInUserId);
    const isStartup = me.role === "startup";

    // Convert StartupProfile / InvestorProfile ➝ simple user object
    const convertProfileToUser = (profile, roleLabel, subtitle) => {
      if (!profile || !profile.userId) return null;

      return {
        _id: profile.userId._id,
        name: roleLabel === "startup" ? profile.startupName : profile.investorName,
        role: roleLabel,
        subtitle,
      };
    };

    // --------------------------
    // LAST MESSAGE HELPER
    // --------------------------
    const getLastMessage = async (user1, user2) => {
      const roomId = [user1, user2].sort().join("_");

      const lastMsg = await Message.findOne({ roomId })
        .sort({ createdAt: -1 })
        .lean();

      return {
        lastMessage: lastMsg?.text || "No messages yet",
        lastMessageTime: lastMsg?.createdAt || null,
      };
    };

    // --------------------------
    // UNREAD HELPER
    // --------------------------
    const getUnreadCount = async (user1, user2) => {
      const roomId = [user1, user2].sort().join("_");

      const status = await ChatStatus.findOne({ userId: user1, roomId });
      const lastSeen = status?.lastSeen || new Date(0);

      const unread = await Message.countDocuments({
        roomId,
        senderId: user2,
        createdAt: { $gt: lastSeen },
      });

      return unread;
    };

    // --------------------------
    // ACCEPTED USERS
    // --------------------------

    const accepted = [];
    const acceptedRequests = await Request.find({ status: "accepted" })
      .populate("startupId")
      .populate("investorId");

    for (const reqDoc of acceptedRequests) {
      const startupProfile = await Startup.findById(reqDoc.startupId).populate("userId");
      const investorProfile = await Investor.findById(reqDoc.investorId).populate("userId");

      if (!startupProfile || !investorProfile) continue;

      // When logged-in user is the STARTUP
      if (String(startupProfile.userId._id) === loggedInUserId) {
        const obj = convertProfileToUser(investorProfile, "investor", "Accepted request");
        if (obj) {
          const last = await getLastMessage(loggedInUserId, obj._id);
const unread = await getUnreadCount(loggedInUserId, obj._id);
accepted.push({ ...obj, ...last, unread });
        }
      }

      // When logged-in user is the INVESTOR
      if (String(investorProfile.userId._id) === loggedInUserId) {
        const obj = convertProfileToUser(startupProfile, "startup", "Accepted request");
        if (obj) {
          const last = await getLastMessage(loggedInUserId, obj._id);
const unread = await getUnreadCount(loggedInUserId, obj._id);
accepted.push({ ...obj, ...last, unread });
        }
      }
    }

    // --------------------------
    // SENT USERS (pending)
    // --------------------------

    const sent = [];

    if (isStartup) {
      const pending = await Request.find({ status: "pending" }).populate("investorId");

      for (const reqDoc of pending) {
        const profile = await Investor.findById(reqDoc.investorId).populate("userId");
        if (!profile) continue;

        const obj = convertProfileToUser(profile, "investor", "Request sent");
        if (obj) {
          const last = await getLastMessage(loggedInUserId, obj._id);
          const unread = await getUnreadCount(loggedInUserId, obj._id);
          sent.push({ ...obj, ...last, unread });
        }
      }
    } else {
      const pending = await Request.find({ status: "pending" }).populate("startupId");

      for (const reqDoc of pending) {
        const profile = await Startup.findById(reqDoc.startupId).populate("userId");
        if (!profile) continue;

        const obj = convertProfileToUser(profile, "startup", "Request received");
        if (obj) {
          const last = await getLastMessage(loggedInUserId, obj._id);
          const unread = await getUnreadCount(loggedInUserId, obj._id);
          sent.push({ ...obj, ...last, unread });
        }
      }
    }

    // --------------------------
    // INTEREST USERS
    // --------------------------

    const interest = [];

    if (isStartup) {
      const myStartup = await Startup.findOne({ userId: loggedInUserId });

      if (myStartup) {
        const investors = await Investor.find({
          preferredIndustries: myStartup.industry,
        }).populate("userId");

        for (const inv of investors) {
          if (!inv?.userId || String(inv.userId._id) === loggedInUserId) continue;

          const obj = convertProfileToUser(inv, "investor", "Similar interest");
          if (obj) {
            const last = await getLastMessage(loggedInUserId, obj._id);
            const unread = await getUnreadCount(loggedInUserId, obj._id);
            interest.push({ ...obj, ...last, unread });
          }
        }
      }
    } else {
      const myInvestor = await Investor.findOne({ userId: loggedInUserId });

      if (myInvestor) {
        const startups = await Startup.find({
          industry: { $in: myInvestor.preferredIndustries },
        }).populate("userId");

        for (const st of startups) {
          if (!st?.userId || String(st.userId._id) === loggedInUserId) continue;

          const obj = convertProfileToUser(st, "startup", "Similar interest");
          if (obj) {
            const last = await getLastMessage(loggedInUserId, obj._id);
            const unread = await getUnreadCount(loggedInUserId, obj._id);
            interest.push({ ...obj, ...last, unread });
          }
        }
      }
    }

    return res.json({ accepted, sent, interest });

  } catch (err) {
    console.error("Error in getChatUsers:", err);
    return res.status(500).json({ message: "Error fetching chat users" });
  }
};
