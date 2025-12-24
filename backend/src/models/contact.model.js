import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "blocked"],
    default: "pending",
  },
  group: {
    type: String,
    default: "general",
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  nickname: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Compound index to prevent duplicate requests
contactSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;