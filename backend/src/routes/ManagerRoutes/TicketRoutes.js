// src/routes/ManagerRoutes/TicketRoutes.js
const express = require("express");
const router = express.Router();

const Ticket = require("../../models/Ticket");
const User = require("../../models/User");

/**
 * Helper to shape a ticket for the frontend
 */
function mapTicket(doc) {
  const t = doc.toObject ? doc.toObject() : doc;

  return {
    id: t._id.toString(),
    subject: t.subject,
    fromRole: t.fromRole,
    fromUserId: t.fromUser ? t.fromUser._id?.toString() : null,
    fromName: t.fromUser ? t.fromUser.fullName : "",
    fromEmail: t.fromUser ? t.fromUser.email : "",
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    messages: (t.messages || []).map((m, idx) => ({
      _id: m._id ? m._id.toString() : idx.toString(),
      senderRole: m.senderRole,
      text: m.text,
      at: m.at,
    })),
  };
}

/**
 * POST /api/tickets
 * Create a new ticket (owner or advisor).
 *
 * Body:
 * {
 *   fromUserId: string (User._id),
 *   fromRole: "owner" | "advisor",
 *   subject: string,
 *   message: string
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { fromUserId, fromRole, subject, message } = req.body;

    if (!fromUserId || !fromRole || !subject || !message) {
      return res
        .status(400)
        .json({ message: "fromUserId, fromRole, subject and message are required." });
    }

    if (!["owner", "advisor"].includes(fromRole)) {
      return res.status(400).json({ message: "fromRole must be 'owner' or 'advisor'." });
    }

    // Make sure user exists (nice to have)
    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const ticket = await Ticket.create({
      fromUser: fromUserId,
      fromRole,
      subject,
      messages: [
        {
          senderRole: fromRole,
          text: message,
        },
      ],
      status: "open",
    });

    // Populate so the frontend receives fromName / fromEmail
    const populated = await Ticket.findById(ticket._id)
      .populate("fromUser", "fullName email");

    return res.status(201).json(mapTicket(populated));
  } catch (err) {
    console.error("POST /api/tickets error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/tickets
 *
 * Manager:  GET /api/tickets          -> all tickets
 * Owner:    GET /api/tickets?role=owner&userId=...   -> only their tickets
 * Advisor:  GET /api/tickets?role=advisor&userId=... -> only their tickets
 */
router.get("/", async (req, res) => {
  try {
    const { role, userId } = req.query;

    let filter = {};
    // If role & userId provided, return only that user's tickets
    if (role && userId) {
      filter = { fromUser: userId };
    }

    const tickets = await Ticket.find(filter)
      .sort({ updatedAt: -1 })
      .populate("fromUser", "fullName email");

    const mapped = tickets.map(mapTicket);
    return res.json(mapped);
  } catch (err) {
    console.error("GET /api/tickets error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/tickets/:id/status
 * Body: { status: "open" | "inprogress" | "resolved" }
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["open", "inprogress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });

    ticket.status = status;
    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("fromUser", "fullName email");

    return res.json(mapTicket(populated));
  } catch (err) {
    console.error("PUT /api/tickets/:id/status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/tickets/:id/reply
 * Body:
 * {
 *   senderRole: "owner" | "advisor" | "manager",
 *   text: string
 * }
 */
router.post("/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { senderRole, text } = req.body;

    if (!senderRole || !text) {
      return res
        .status(400)
        .json({ message: "senderRole and text are required." });
    }

    if (!["owner", "advisor", "manager"].includes(senderRole)) {
      return res
        .status(400)
        .json({ message: "senderRole must be owner, advisor or manager." });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });

    ticket.messages.push({
      senderRole,
      text,
      at: new Date(),
    });

    // When someone replies, keep it open/in progress (don't override manually chosen status)
    if (ticket.status === "resolved") {
      ticket.status = "inprogress";
    }

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate("fromUser", "fullName email");

    return res.json(mapTicket(populated));
  } catch (err) {
    console.error("POST /api/tickets/:id/reply error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

