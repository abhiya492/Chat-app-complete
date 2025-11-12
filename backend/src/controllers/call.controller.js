import Call from "../models/call.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const initiateCall = async (req, res) => {
  try {
    const { receiverId, type } = req.body;
    const callerId = req.user._id;

    const call = new Call({
      callerId,
      receiverId,
      type,
      status: "initiated",
    });

    await call.save();
    await call.populate("callerId receiverId", "fullName profilePic");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", call);
    }

    res.status(201).json(call);
  } catch (error) {
    console.error("Error in initiateCall:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .populate("callerId receiverId", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(calls);
  } catch (error) {
    console.error("Error in getCallHistory:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    const { status, duration } = req.body;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    call.status = status;
    if (status === "accepted" && !call.startedAt) {
      call.startedAt = new Date();
    }
    if (status === "ended" && duration) {
      call.duration = duration;
      call.endedAt = new Date();
    }

    await call.save();
    res.status(200).json(call);
  } catch (error) {
    console.error("Error in updateCallStatus:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
