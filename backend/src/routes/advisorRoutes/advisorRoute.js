const express = require("express");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// Models
const User = require("../../models/User");     // advisor now is User with role="advisor"
const Owner = require("../../models/Owner");
const BusinessData = require("../../models/BusinessData");
const Feedback = require("../../models/advisorModels/Feedback");
const Recommendation = require("../../models/advisorModels/Recommendation");
const Notification = require("../../models/advisorModels/Notification");
const Assignment = require("../../models/Assignment");
const Ticket = require("../../models/Ticket");
const SharedBusinessData = require("../../models/SharedBusinessData");



// Risk Engine
const { evaluateOwnerRisk } = require("../../utils/riskEngine");

// Debug
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/advisor" });
});

// Dashboard
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const advisor = await User.findOne({ _id: advisorId, role: "advisor" });
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    const assignments = await Assignment.find({ advisorId }).lean();
    const ownerIds = assignments.map(a => a.ownerId);

    const owners = await Owner.find({ _id: { $in: ownerIds } })
      .populate("businessData")
      .lean();

    const ownersWithData = owners.map(o => ({
      ...o,
      username: o.username || undefined,
    }));

    const riskData = ownersWithData.map(o =>
      evaluateOwnerRisk(o.businessData || {})
    );

    return res.json({
      advisor,
      owners: ownersWithData,
      riskData,
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Tickets
router.get("/tickets/:advisorId", async (req, res) => {
  try {
    const tickets = await Ticket.find({
      advisorId: req.params.advisorId
    }).sort({ createdAt: -1 });

    return res.json(tickets);
  } catch {
    return res.status(500).json({ msg: "Server error" });
  }
});

// Notifications
router.get("/notifications/:advisorId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      advisorId: req.params.advisorId
    }).sort({ createdAt: -1 });

    return res.json(notifications);
  } catch {
    return res.status(500).json({ msg: "Server error" });
  }
});

// Add feedback
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
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// List all feedback
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

// Delete feedback
router.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Feedback not found" });

    return res.json({ msg: "Feedback deleted", deleted });

  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Update feedback
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

router.post("/recommendations", async (req, res) => {
  try {
    const { advisorId, ownerId, scenarioId, text } = req.body;

    if (!advisorId || !text?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newRec = await Recommendation.create({
      advisorId,
      ownerId: ownerId || null,
      scenarioId: scenarioId || null,
      text,
    });

    return res.json({ success: true, recommendation: newRec });

  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});


// Advisor recommendations
router.get("/recommendations/:advisorId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Owner recommendations
router.get("/recommendations/owner/:ownerId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      ownerId: req.params.ownerId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch {
    return res.status(500).json({ msg: "Server error" });
  }
});

// Get owners assigned to advisor
router.get("/owners/:advisorId", async (req, res) => {
  try {
    const { advisorId } = req.params;

    const assignments = await Assignment.find({ advisorId }).lean();
    const ownerIds = assignments.map(a => a.ownerId);

    const owners = await Owner.find({ _id: { $in: ownerIds } })
      .select("_id fullName username")
      .lean();

    return res.json({ success: true, owners });

  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "..", "..", "uploads", "feedback")),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

router.post("/feedback/file", upload.single("file"), async (req, res) => {
  try {
    const { advisorId, ownerId } = req.body;

    if (!advisorId || !ownerId) {
      return res.status(400).json({
        message: "advisorId and ownerId are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
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
    return res.status(500).json({ message: "Server error" });
  }
});
//Get recommendations for a specific owner
router.get("/recommendations/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const list = await Recommendation.find({ ownerId })
      .sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Owner recommendations error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});


// SEND NOTIFICATION TO ADVISOR
router.post("/notifications", async (req, res) => {
  try {
    const { receiverId, title, message, fromRole } = req.body;

    if (!receiverId || !title || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const notif = await Notification.create({
      advisorId: receiverId,
      title,
      message,
      fromRole: fromRole || "owner",
    });

    return res.json({ success: true, notification: notif });

  } catch (err) {
    console.error("POST /advisor/notifications ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/shared-business/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const shared = await SharedBusinessData.findOne({ ownerId }).lean();

    if (!shared) {
      return res.json({
        success: true,
        sharedBusiness: null,
        message: "No shared business data found for this owner.",
      });
    }

    return res.json({
      success: true,
      sharedBusiness: shared.businessData,
    });

  } catch (err) {
    console.error("Shared business fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
