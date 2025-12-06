// backend/src/models/SupportTicket.js
const mongoose = require("mongoose");

// One message in the conversation
const SupportTicketMessageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ["owner", "advisor", "manager"],
      required: true,
    },
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// The support ticket
const SupportTicketSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromRole: {
      type: String,
      enum: ["owner", "advisor"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    messages: {
      type: [SupportTicketMessageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["open", "inprogress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

// This model writes to the `supporttickets` collection
module.exports =
  mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", SupportTicketSchema);
