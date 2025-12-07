const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Owner = require("../models/Owner");
const Assignment = require("../models/Assignment");

const Feedback = require("../models/advisorModels/Feedback");
const OwnerNotification = require("../models/OwnerNotification");
const AdvisorNotification = require("../models/advisorModels/Notification");
const SharedSimulation = require("../models/advisorModels/SharedSimulation");
const SharedBusinessData = require("../models/SharedBusinessData");

/* ===========================
   LINK OWNER ↔ ADVISOR
=========================== */
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "ownerId and advisorId required" });
    }

    const advisor = await User.findOne({ _id: advisorId, role: "advisor" });
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    const existing = await Assignment.findOne({ ownerId, advisorId });
    if (existing) {
      return res.status(400).json({ msg: "Already linked" });
    }

    const created = await Assignment.create({ ownerId, advisorId });

    return res.json({
      msg: "Owner linked successfully",
      assignment: created,
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});


/* ================================
   GET ALL FEEDBACK FOR ONE OWNER
================================ */
router.get("/feedback/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const feedback = await Feedback.find({ ownerId })
      .sort({ createdAt: -1 })
      .populate("advisorId", "fullName email");

    return res.json({ success: true, feedback });

  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});


/* ================================
   SEND NOTIFICATION TO OWNER
================================ */
router.post("/notifications", async (req, res) => {
  try {
    const { ownerId, title, message } = req.body;

    if (!ownerId || !title || !message)
      return res.status(400).json({ msg: "Missing fields" });

    const notif = await OwnerNotification.create({
      ownerId,
      title,
      message,
    });

    return res.status(201).json({ success: true, notification: notif });

  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});


/* ================================
   GET OWNER NOTIFICATIONS
================================ */
router.get("/notifications/:ownerId", async (req, res) => {
  try {
    const list = await OwnerNotification.find({
      ownerId: req.params.ownerId,
    }).sort({ createdAt: -1 });

    return res.json({ success: true, notifications: list });

  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});


/* ================================
   MARK OWNER NOTIFICATION AS READ
================================ */
router.put("/notifications/read/:id", async (req, res) => {
  try {
    const updated = await OwnerNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    return res.json({ success: true, notification: updated });

  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
});

/* ================================
   SHARE OWNER DATA WITH ADVISOR
================================ */
router.post("/share", async (req, res) => {
  try {
    const { ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({ msg: "ownerId is required" });
    }

    // Get owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ msg: "Owner not found" });
    }

    // Get advisorId from Assignment
    const assignment = await Assignment.findOne({ ownerId }).lean();
    if (!assignment || !assignment.advisorId) {
      return res.status(404).json({ msg: "No advisor linked to this owner" });
    }

    const advisorId = assignment.advisorId;

    // Create advisor notification
    await AdvisorNotification.create({
      advisorId,
      title: "New Data Shared",
      message: `${owner.username} has shared their business data with you.`,
    });

    return res.json({
      success: true,
      msg: "Data shared successfully",
      advisorId
    });

  } catch (err) {
    console.error("Share error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ================================
   GET ADVISOR ASSIGNED TO OWNER
================================ */
router.get("/advisor/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Find the assignment that links Owner → Advisor
    const assignment = await Assignment.findOne({ ownerId }).lean();

    if (!assignment || !assignment.advisorId) {
      return res.status(404).json({
        success: false,
        message: "No advisor linked to this owner",
      });
    }

    return res.json({
      success: true,
      advisorId: assignment.advisorId,
    });

  } catch (err) {
    console.error("Error fetching advisor:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
/* ============================================================
   SHARE FULL OWNER SIMULATION DATA WITH ADVISOR
============================================================ */
router.post("/share/full", async (req, res) => {
  try {
    const {
      ownerId,
      advisorId,
      healthScore,
      cashInsights,
      bepInsights,
      pricingInsights,
      recommendations
    } = req.body;

    if (!ownerId || !advisorId)
      return res.status(400).json({ success: false, msg: "Missing IDs" });

    const created = await SharedSimulation.create({
      ownerId,
      advisorId,
      healthScore,
      cashInsights,
      bepInsights,
      pricingInsights,
      recommendations
    });

    return res.json({
      success: true,
      msg: "Simulation shared successfully",
      data: created
    });

  } catch (err) {
    console.error("❌ Error sharing full data:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});
// ================================
// SHARE FULL BUSINESS DATA WITH ADVISOR
// ================================
router.post("/share/full-business", async (req, res) => {
  try {
    const { ownerId, advisorId, businessData } = req.body;

    if (!ownerId || !advisorId || !businessData) {
      return res.status(400).json({
        success: false,
        message: "ownerId, advisorId, and businessData are required",
      });
    }

    // Save to SharedBusinessData collection
    const saved = await SharedBusinessData.create({
      ownerId,
      advisorId,
      businessData,
    });

    return res.json({
      success: true,
      message: "Full business data shared successfully",
      shared: saved,
    });

  } catch (err) {
    console.error("Full business share error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
