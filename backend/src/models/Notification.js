const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientRole: {
      type: String,
      enum: ["owner", "advisor", "manager"],
      required: true,
    },

    type: {
      type: String,
      enum: ["ticket_created", "ticket_reply", "system"],
      default: "system",
    },

    title: { type: String, required: true },
    body: { type: String },

    // optional link to a ticket
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// avoid OverwriteModelError in dev
module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
