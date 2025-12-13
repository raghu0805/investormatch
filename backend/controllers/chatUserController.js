import Request from "../models/Request.js";
import Startup from "../models/StartupProfile.js";
import Investor from "../models/InvestorProfile.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import ChatStatus from "../models/ChatStatus.js";

export const getChatUsers = async (req, res) => {
  try {
    const loggedInUserId = req.userId;

    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const me = await User.findById(loggedInUserId);
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    const isStartup = me.role === "startup";

    /* ---------------------------------------------------
       HELPERS
    --------------------------------------------------- */

    const convertProfileToUser = (profile, roleLabel, subtitle) => {
      if (!profile || !profile.userId || !profile.userId._id) return null;

      return {
        _id: profile.userId._id.toString(),
        name:
          roleLabel === "startup"
            ? profile.startupName
            : profile.investorName,
        role: roleLabel,
        subtitle,
      };
    };

    const getLastMessage = async (user1, user2) => {
      if (!user1 || !user2) {
        return { lastMessage: "No messages yet", lastMessageTime: null };
      }

      const roomId = [user1, user2].sort().join("_");

      const lastMsg = await Message.findOne({ roomId })
        .sort({ createdAt: -1 })
        .lean();

      return {
        lastMessage: lastMsg?.text || "No messages yet",
        lastMessageTime: lastMsg?.createdAt || null,
      };
    };

    const getUnreadCount = async (user1, user2) => {
      if (!user1 || !user2) return 0;

      const roomId = [user1, user2].sort().join("_");

      const status = await ChatStatus.findOne({
        userId: user1,
        roomId,
      });

      const lastSeen = status?.lastSeen || new Date(0);

      return Message.countDocuments({
        roomId,
        senderId: user2,
        createdAt: { $gt: lastSeen },
      });
    };

    /* ---------------------------------------------------
       FETCH LOGGED-IN PROFILE
    --------------------------------------------------- */

    let myStartupProfile = null;
    let myInvestorProfile = null;

    if (isStartup) {
      myStartupProfile = await Startup.findOne({ userId: loggedInUserId });
      if (!myStartupProfile) {
        return res.json({ accepted: [], sent: [], interest: [] });
      }
    } else {
      myInvestorProfile = await Investor.findOne({ userId: loggedInUserId });
      if (!myInvestorProfile) {
        return res.json({ accepted: [], sent: [], interest: [] });
      }
    }

    /* ---------------------------------------------------
       ACCEPTED USERS
    --------------------------------------------------- */

    const accepted = [];

    const acceptedRequests = await Request.find({
      status: "accepted",
      ...(isStartup
        ? { startupId: myStartupProfile._id }
        : { investorId: myInvestorProfile._id }),
    });

    for (const reqDoc of acceptedRequests) {
      const startupProfile = await Startup.findById(
        reqDoc.startupId
      ).populate("userId");

      const investorProfile = await Investor.findById(
        reqDoc.investorId
      ).populate("userId");

      if (
        !startupProfile?.userId ||
        !investorProfile?.userId
      ) {
        continue;
      }

      if (isStartup) {
        const obj = convertProfileToUser(
          investorProfile,
          "investor",
          "Accepted request"
        );
        if (!obj) continue;

        const last = await getLastMessage(loggedInUserId, obj._id);
        const unread = await getUnreadCount(loggedInUserId, obj._id);

        accepted.push({ ...obj, ...last, unread });
      } else {
        const obj = convertProfileToUser(
          startupProfile,
          "startup",
          "Accepted request"
        );
        if (!obj) continue;

        const last = await getLastMessage(loggedInUserId, obj._id);
        const unread = await getUnreadCount(loggedInUserId, obj._id);

        accepted.push({ ...obj, ...last, unread });
      }
    }

    /* ---------------------------------------------------
       SENT / PENDING USERS
    --------------------------------------------------- */

    const sent = [];

    const pendingRequests = await Request.find({
      status: "pending",
      ...(isStartup
        ? { startupId: myStartupProfile._id }
        : { investorId: myInvestorProfile._id }),
    });

    for (const reqDoc of pendingRequests) {
      const profile = isStartup
        ? await Investor.findById(reqDoc.investorId).populate("userId")
        : await Startup.findById(reqDoc.startupId).populate("userId");

      if (!profile?.userId) continue;

      const obj = convertProfileToUser(
        profile,
        isStartup ? "investor" : "startup",
        isStartup ? "Request sent" : "Request received"
      );

      if (!obj) continue;

      const last = await getLastMessage(loggedInUserId, obj._id);
      const unread = await getUnreadCount(loggedInUserId, obj._id);

      sent.push({ ...obj, ...last, unread });
    }

    /* ---------------------------------------------------
       INTEREST USERS
    --------------------------------------------------- */

    const interest = [];

    if (isStartup) {
      const investors = await Investor.find({
        preferredIndustries: myStartupProfile.industry,
      }).populate("userId");

      for (const inv of investors) {
        if (!inv?.userId || String(inv.userId._id) === loggedInUserId) continue;

        const obj = convertProfileToUser(
          inv,
          "investor",
          "Similar interest"
        );
        if (!obj) continue;

        const last = await getLastMessage(loggedInUserId, obj._id);
        const unread = await getUnreadCount(loggedInUserId, obj._id);

        interest.push({ ...obj, ...last, unread });
      }
    } else {
      const startups = await Startup.find({
        industry: { $in: myInvestorProfile.preferredIndustries },
      }).populate("userId");

      for (const st of startups) {
        if (!st?.userId || String(st.userId._id) === loggedInUserId) continue;

        const obj = convertProfileToUser(
          st,
          "startup",
          "Similar interest"
        );
        if (!obj) continue;

        const last = await getLastMessage(loggedInUserId, obj._id);
        const unread = await getUnreadCount(loggedInUserId, obj._id);

        interest.push({ ...obj, ...last, unread });
      }
    }

    return res.json({ accepted, sent, interest });

  } catch (err) {
    console.error("Error in getChatUsers:", err);
    return res.status(500).json({ message: "Error fetching chat users" });
  }
};
