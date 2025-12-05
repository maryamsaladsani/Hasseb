// backend/src/models/Ticket.js
const mongoose = require("mongoose");

// One message inside a ticket (conversation)
const TicketMessageSchema = new mongoose.Schema(
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

// Ticket itself
const TicketSchema = new mongoose.Schema(
  {
    // Who created the ticket (User collection _id)
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Role of that user (owner or advisor)
    fromRole: {
      type: String,
      enum: ["owner", "advisor"],
      required: true,
    },

    // Title of the ticket
    subject: {
      type: String,
      required: true,
    },

    // Conversation messages
    messages: {
      type: [TicketMessageSchema],
      default: [],
    },

    // Ticket status
    status: {
      type: String,
      enum: ["open", "inprogress", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev reloads
module.exports =
  mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
