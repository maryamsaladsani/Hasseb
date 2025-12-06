// ======================================================
// IMPORTS
// ======================================================
const express = require("express");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// MODELS
const Advisor = require("../../models/advisorModels/advisor");
const Owner = require("../../models/Owner");
const User = require("../../models/User");
const BusinessData = require("../../models/BusinessData");

const Feedback = require("../../models/advisorModels/Feedback");
const Recommendation = require("../../models/advisorModels/Recommendation");
const Notification = require("../../models/advisorModels/Notification");
const Assignment = require("../../models/Assignment");
const Ticket = require("../../models/Ticket");

// RISK ENGINE
const { evaluateOwnerRisk } = require("../../utils/riskEngine");

// ======================================================
// DEBUG ROUTE
// ======================================================
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/advisor" });
});

// ======================================================
// DASHBOARD
// ======================================================
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    const owners = await Owner.find({ advisor: advisorId })
      .populate("businessData")
      .lean();

    const ownersWithData = owners.map((o) => ({
      ...o,
      username: o.username || undefined,
    }));

    const riskData = ownersWithData.map((o) =>
      evaluateOwnerRisk(o.businessData || {})
    );

    return res.json({
      advisor,
      owners: ownersWithData,
      riskData,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// ⭐ FIX: TICKETS ROUTE FOR ADVISOR PANEL
// ======================================================
router.get("/tickets/:advisorId", async (req, res) => {
  try {
    const tickets = await Ticket.find({
      advisorId: req.params.advisorId
    }).sort({ createdAt: -1 });

    return res.json(tickets); // ✔ must return array
  } catch (err) {
    console.error("Tickets error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// ⭐⭐ FIX: NOTIFICATIONS ROUTE (THE ERROR YOU HAD)
// ======================================================
router.get("/notifications/:advisorId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      advisorId: req.params.advisorId
    }).sort({ createdAt: -1 });

    return res.json(notifications); // ✔ FIX — MUST return array directly
  } catch (err) {
    console.error("Notifications error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// FEEDBACK — ADD
// ======================================================
router.post("/feedback", async (req, res) => {
  try {
    const { advisorId, ownerId, content } = req.body;

    if (!advisorId || !ownerId || !content?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const fb = await Feedback.create({ advisorId, ownerId, content });

    return res.json({
      success: true,
      feedback: fb,
    });

  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — GET ALL
// ======================================================
router.get("/feedback/all/:advisorId", async (req, res) => {
  try {
    const list = await Feedback.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — DELETE
// ======================================================
router.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Feedback not found" });

    return res.json({ msg: "Feedback deleted", deleted });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — UPDATE
// ======================================================
router.put("/feedback/:id", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ msg: "Content is required" });
    }

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Feedback not found" });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// ⭐ FINAL RECOMMENDATION SYSTEM
// ======================================================
router.post("/recommendations", async (req, res) => {
  try {
    const { advisorId, ownerId, scenarioId, text } = req.body;

    if (!advisorId || !ownerId || !scenarioId || !text?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newRec = await Recommendation.create({
      advisorId,
      ownerId,
      scenarioId,
      text,
    });

    return res.json({ success: true, recommendation: newRec });

  } catch (err) {
    console.error("Recommendation error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Advisor ID
router.get("/recommendations/:advisorId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Get recommendations error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Owner ID
router.get("/recommendations/owner/:ownerId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      ownerId: req.params.ownerId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Owner Recommendations error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// OWNERS LINKED TO ADVISOR
// ======================================================
router.get("/owners/:advisorId", async (req, res) => {
  try {
    const owners = await Owner.find({ advisor: req.params.advisorId })
      .select("_id fullName username")
      .lean();

    return res.json({ success: true, owners });
  } catch (err) {
    console.error("GET OWNERS ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FILE UPLOAD FOR FEEDBACK
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "feedback"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/feedback/file", upload.single("file"), async (req, res) => {
  try {
    const { advisorId, ownerId } = req.body;

    if (!advisorId || !ownerId) {
      return res.status(400).json({ message: "advisorId and ownerId are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/feedback/${req.file.filename}`;

    const fb = await Feedback.create({
      advisorId,
      ownerId,
      fileUrl,
      content: "",
    });

    return res.status(201).json(fb);

  } catch (err) {
    console.error("FILE FEEDBACK ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
// GET ALL FEEDBACK FOR ADVISOR
router.get("/feedback/:advisorId", async (req, res) => {
    try {
        const list = await Feedback.find({ advisorId: req.params.advisorId })
            .sort({ createdAt: -1 });

        res.json({ success: true, feedback: list });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server error" });
    }
});


module.exports = router;
