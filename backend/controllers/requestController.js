import Request from '../models/Request.js';
import Investor from "../models/InvestorProfile.js";
import Student from "../models/StudentProfile.js";
import { generateRoomId } from "../utils/createRoom.js";

const sendStudentRequest = async (req, res) => {
  try {
    // Convert logged-in user → StudentProfile ID
    const student = await Student.findOne({ userId: req.userId });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const studentId = student._id;

    const { investorId } = req.body;

    if (!investorId || !studentId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const requestExist = await Request.findOne({
      investorId,
      $or: [{ studentId }, { startupId: studentId }]
    });

    if (requestExist) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const roomId = generateRoomId(studentId, investorId);

    // Create request with correct studentId and startupId
    const created = await Request.create({
      investorId,
      studentId,
      startupId: studentId,
      roomId,
      senderRole: "student"
    });

    return res.status(201).json({ message: "Request created", data: created });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const sendInvestorRequest = async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.userId });

    if (!investor) {
      return res.status(404).json({ message: "Investor profile not found" });
    }

    const investorId = investor._id;

    const { studentId, startupId } = req.body;
    const targetStudentId = studentId || startupId;

    if (!investorId || !targetStudentId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const requestExist = await Request.findOne({
      investorId,
      $or: [{ studentId: targetStudentId }, { startupId: targetStudentId }]
    });

    if (requestExist) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const roomId = generateRoomId(targetStudentId, investorId);
    const created = await Request.create({
      investorId,
      studentId: targetStudentId,
      startupId: targetStudentId,
      roomId,
      senderRole: "investor"
    });
    return res.status(201).json({ message: "Request created", data: created });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const studentId = student._id;

    const sent = await Request.find({
      $or: [{ studentId }, { startupId: studentId }],
      senderRole: { $in: ["student", "startup"] }
    }).populate({
      path: "investorId",
      populate: { path: "userId", select: "email name picture" }
    });

    return res.status(200).json({ message: "Sent requests fetched", data: sent });
  } catch (err) {
    console.error("Error in getSentRequests:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.userId });

    if (!investor) {
      return res.status(404).json({ message: "Investor profile not found" });
    }

    const received = await Request.find({
      investorId: investor._id,
      senderRole: { $in: ["student", "startup"] }
    })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "email name picture" }
      })
      .populate({
        path: "startupId",
        populate: { path: "userId", select: "email name picture" }
      });

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
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("requestStatusUpdated", {
        requestId: updated._id.toString(),
        status: updated.status,
        updated
      });
    }

    return res.status(200).json({ message: "Request updated", data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const checkingAlreadySent = async (req, res) => {
  try {
    const studentId = req.userId;
    const investorId = req.query.investorId;
    const requestExist = await Request.findOne({
      investorId,
      $or: [{ studentId }, { startupId: studentId }]
    });
    if (requestExist) {
      return res.status(400).json({ message: "The request is already sent" });
    }
    return res.status(200).json({ message: "The request is not sent" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const checkingInvestorAlreadySent = async (req, res) => {
  try {
    const investorId = req.userId;
    const targetStudentId = req.query.studentId || req.query.startupId;
    const requestExist = await Request.findOne({
      investorId,
      $or: [{ studentId: targetStudentId }, { startupId: targetStudentId }]
    });
    if (requestExist) {
      return res.status(400).json({ message: "The request is already sent" });
    }
    return res.status(200).json({ message: "The request is not sent" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const getInvestorSentRequests = async (req, res) => {
  try {
    const investor = await Investor.findOne({ userId: req.userId });
    if (!investor) return res.status(404).json({ message: "Investor not found" });

    const sent = await Request.find({
      investorId: investor._id,
      senderRole: "investor"
    })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "email name picture" }
      })
      .populate({
        path: "startupId",
        populate: { path: "userId", select: "email name picture" }
      });

    return res.status(200).json({ data: sent });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getStudentReceivedRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const received = await Request.find({
      $or: [{ studentId: student._id }, { startupId: student._id }],
      senderRole: "investor"
    }).populate({
      path: "investorId",
      populate: { path: "userId", select: "email name picture" }
    });

    return res.status(200).json({ data: received });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export {
  sendStudentRequest,
  sendStudentRequest as sendStartupRequest,
  sendInvestorRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  checkingAlreadySent,
  checkingInvestorAlreadySent,
  getInvestorSentRequests,
  getStudentReceivedRequests,
  getStudentReceivedRequests as getStartupReceivedRequests
};
