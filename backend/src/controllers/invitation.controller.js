  import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import { sendInvitationEmail } from "../lib/email.js";
import crypto from "crypto";

export const sendInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    const inviter = req.user;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    const existingInvitation = await Invitation.findOne({
      inviteeEmail: email,
      status: "pending",
    });

    if (existingInvitation) {
      return res.status(400).json({ message: "Invitation already sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = new Invitation({
      inviterEmail: inviter.email,
      inviterName: inviter.fullName,
      inviteeEmail: email,
      token,
      expiresAt,
    });

    await invitation.save();
    await sendInvitationEmail(email, inviter.fullName, token);

    res.status(200).json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      inviterEmail: req.user.email,
    }).sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error getting invitations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
