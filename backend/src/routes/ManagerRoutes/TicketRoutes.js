// backend/src/routes/TicketRoutes.js
const express = require("express");
const router = express.Router();

const Ticket = require("../../models/SupportTicket");
const User = require("../../models/User");


// map DB → frontend
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
 * body: { fromUserId, fromRole, subject, message }
 */
router.post("/", async (req, res) => {
  try {
    const { fromUserId, fromRole, subject, message } = req.body;

    if (!fromUserId || !fromRole || !subject || !message) {
      return res
        .status(400)
        .json({ msg: "fromUserId, fromRole, subject and message are required." });
    }

    if (!["owner", "advisor"].includes(fromRole)) {
      return res.status(400).json({ msg: "fromRole must be 'owner' or 'advisor'." });
    }

    const user = await User.findById(fromUserId);
    if (!user) return res.status(404).json({ msg: "User not found." });

    const created = await Ticket.create({
      fromUser: fromUserId,
      fromRole,
      subject,
      messages: [{ senderRole: fromRole, text: message }],
      status: "open",
    });

    const populated = await Ticket.findById(created._id).populate(
      "fromUser",
      "fullName email"
    );

    return res.status(201).json(mapTicket(populated));
  } catch (err) {
    console.error("POST /api/tickets error:", err);
    return res
      .status(500)
      .json({ msg: "Failed to create ticket", error: err.message });
  }
});

/**
 * GET /api/tickets
 * Manager:  GET /api/tickets
 * Advisor:  GET /api/tickets?role=advisor&userId=...
 * Owner:    GET /api/tickets?role=owner&userId=...
 */
router.get("/", async (req, res) => {
  try {
    const { role, userId, username } = req.query;

    let filter = {};

    // If role + userId/username are provided → only that user's tickets
    if (role && (userId || username)) {
      let userObjectId = userId;

      // If username is provided, look up the user's _id first
      if (!userObjectId && username) {
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(404).json({ msg: "User not found for username." });
        }
        userObjectId = user._id.toString();
      }

      filter = { fromUser: userObjectId };
    }
    // Else: no role/user filter → manager sees ALL tickets

    const tickets = await Ticket.find(filter)
      .sort({ updatedAt: -1 })
      .populate("fromUser", "fullName email username");

    return res.json(tickets.map(mapTicket));
  } catch (err) {
    console.error("GET /api/tickets error:", err);
    return res
      .status(500)
      .json({ msg: "Failed to load tickets", error: err.message });
  }
});
/**
 * PUT /api/tickets/:id/status
 * body: { status: "open" | "inprogress" | "resolved" }
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["open", "inprogress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: "Invalid status." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found." });

    ticket.status = status;
    await ticket.save();

    const populated = await Ticket.findById(ticket._id).populate(
      "fromUser",
      "fullName email"
    );

    return res.json(mapTicket(populated));
  } catch (err) {
    console.error("PUT /api/tickets/:id/status error:", err);
    return res
      .status(500)
      .json({ msg: "Failed to update status", error: err.message });
  }
});

/**
 * POST /api/tickets/:id/reply
 * body: { senderRole: "owner" | "advisor" | "manager", text }
 */
router.post("/:id/reply", async (req, res) => {
  try {
    const { senderRole, text } = req.body;

    if (!senderRole || !text) {
      return res
        .status(400)
        .json({ msg: "senderRole and text are required." });
    }

    if (!["owner", "advisor", "manager"].includes(senderRole)) {
      return res
        .status(400)
        .json({ msg: "senderRole must be owner, advisor or manager." });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ msg: "Ticket not found." });

    ticket.messages.push({ senderRole, text, at: new Date() });

    if (ticket.status === "resolved") {
      ticket.status = "inprogress";
    }

    await ticket.save();

    const populated = await Ticket.findById(ticket._id).populate(
      "fromUser",
      "fullName email"
    );

    return res.json(mapTicket(populated));
  } catch (err) {
    console.error("POST /api/tickets/:id/reply error:", err);
    return res
      .status(500)
      .json({ msg: "Failed to add reply", error: err.message });
  }
});

module.exports = router;
