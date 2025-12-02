const express = require("express");
const router = express.Router();
const Ticket = require("../../models/advisorModels/Ticket");

/* ======================================================
   CREATE NEW TICKET
====================================================== */
router.post("/tickets", async (req, res) => {
  try {
    const { advisorId, title, message, priority } = req.body; 
    // ⬅⬅⬅ IMPORTANT — لازم نضيف priority هنا

    // Validate request
    if (!advisorId || !title || !message || !priority) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    // Create ticket (Schema expects: title, message, advisorId, priority)
    const ticket = await Ticket.create({
      advisorId,
      title,
      message,
      priority,     // ⬅ الآن تستخدم المتغير الصحيح
      status: "open",
      createdAt: new Date(),
    });

    return res.json({
      msg: "Ticket created successfully",
      ticket,
    });

  } catch (err) {
    console.error("Ticket creation error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   GET ALL TICKETS FOR ONE ADVISOR
====================================================== */
router.get("/tickets/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;
    const tickets = await Ticket.find({ advisorId }).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (err) {
    console.error("Ticket fetch error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
