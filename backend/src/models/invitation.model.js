import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    inviterEmail: {
      type: String,
      required: true,
    },
    inviterName: {
      type: String,
      required: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", invitationSchema);

export default Invitation;
