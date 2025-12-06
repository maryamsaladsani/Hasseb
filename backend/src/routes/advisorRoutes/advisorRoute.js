// backend/src/routes/advisorRoutes/advisorRoute.js

const express = require("express");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// MODELS
const Advisor = require("../../models/advisorModels/advisor");
const Owner = require("../../models/Owner");
const Ticket = require("../../models/advisorModels/Ticket");
const Feedback = require("../../models/advisorModels/Feedback");
const Recommendation = require("../../models/advisorModels/Recommendation");
const Notification = require("../../models/advisorModels/Notification");
const Assignment = require("../../models/Assignment"); // advisor <-> owner links

// RISK ENGINE
const { evaluateOwnerRisk } = require("../../utils/riskEngine");

/* ======================================================
   DEBUG — Ping route
====================================================== */
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/advisor" });
});

/* ======================================================
   GET DASHBOARD DATA (advisorId in params)
====================================================== */
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    // 1) owners = all owners assigned to this advisor (via Assignment)
    const assignments = await Assignment.find({ advisorId }).populate("ownerId");
    const owners = assignments.map((a) => a.ownerId).filter(Boolean);

    // 2) tickets and feedback for this advisor
    const tickets = await Ticket.find({ advisorId }).sort({ createdAt: -1 });
    const feedback = await Feedback.find({ advisorId }).sort({ createdAt: -1 });

    // 3) Rank among all advisors (by points)
    const allAdvisors = await Advisor.find();
    const sorted = allAdvisors.sort((a, b) => b.points - a.points);
    const rank =
      sorted.findIndex((a) => a._id.toString() === advisorId) + 1;

    // 4) Mock activity chart
    const activity = [
      { day: "Sat", valueA: 450, valueB: 320 },
      { day: "Sun", valueA: 300, valueB: 150 },
      { day: "Mon", valueA: 200, valueB: 280 },
      { day: "Tue", valueA: 480, valueB: 200 },
      { day: "Wed", valueA: 120, valueB: 180 },
      { day: "Thu", valueA: 350, valueB: 290 },
      { day: "Fri", valueA: 260, valueB: 210 },
    ];

    const alerts = [
      {
        name: "Norah",
        msg: "Low cash buffer",
        tags: ["Medium"],
        date: "23 Mar 2024",
        time: "12:45 pm",
      },
      {
        name: "Rakib",
        msg: "High variable costs",
        tags: ["High priority"],
        date: "23 Mar 2024",
        time: "1:30 pm",
      },
    ];

    // 5) Run risk engine for each owner
    const rawRiskData = owners.map((o) => evaluateOwnerRisk(o));

    // 6) Filter risk alerts depending on number of owners
    let filteredRisk = [];

    if (owners.length <= 3) {
      filteredRisk = rawRiskData.map((r) => ({
        ...r,
        filteredAlerts:
          r.alerts.length > 0
            ? r.alerts
            : [
                {
                  type: "Info",
                  msg: "Financial indicators are stable — no immediate risks detected.",
                },
              ],
      }));
    } else {
      filteredRisk = rawRiskData.map((r) => {
        const high = r.alerts.filter((a) => a.type === "High");
        const medium = r.alerts.filter((a) => a.type === "Medium");

        return {
          ...r,
          filteredAlerts:
            high.length > 0
              ? high
              : medium.length > 0
              ? medium
              : [
                  {
                    type: "Info",
                    msg: "No significant risks detected.",
                  },
                ],
        };
      });
    }

    // 7) Auto-create notifications for high-risk owners (once per 24h per owner)
    for (const r of rawRiskData) {
      if (r.level === "High") {
        const exists = await Notification.findOne({
          advisorId,
          message: { $regex: r.ownerId.toString() },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!exists) {
          await Notification.create({
            advisorId,
            title: "High Risk Alert",
            message: `Owner with ID ${r.ownerId} has high risk score (${r.riskScore}).`,
          });
        }
      }
    }

    // 8) Return everything
    return res.json({
      advisor: {
        ...advisor.toObject(),
        rank,
        activity,
        alerts,
      },
      owners,
      tickets,
      feedback,
      riskData: rawRiskData,
      filteredRisk,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   FEEDBACK (TEXT) – advisor adds / manages comments
====================================================== */

// POST /api/advisor/feedback
router.post("/feedback", async (req, res) => {
  try {
    const { advisorId, ownerId, content } = req.body;

    if (!advisorId || !ownerId || !content) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    const fb = await Feedback.create({
      advisorId,
      ownerId,
      ownerName: owner.fullName,
      content,
    });

    console.log("Created text feedback:", fb._id);
    return res.status(201).json(fb);
  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /api/advisor/feedback?advisorId=XXX
router.get("/feedback", async (req, res) => {
  try {
    const { advisorId } = req.query;
    if (!advisorId) {
      return res.status(400).json({ msg: "advisorId is required" });
    }

    const list = await Feedback.find({ advisorId }).sort({ createdAt: -1 });

    console.log(
      "GET /api/advisor/feedback advisorId=",
      advisorId,
      "count=",
      list.length
    );
    return res.json(list);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/advisor/feedback/:id
router.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Feedback not found" });
    }

    return res.json({ msg: "Feedback deleted", deleted });
  } catch (err) {
    console.error("Delete feedback error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/advisor/feedback/:id
router.put("/feedback/:id", async (req, res) => {
  try {
    const { content } = req.body;

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Feedback not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Update feedback error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   SUGGESTIONS (advisor → owner)
====================================================== */

// POST /api/advisor/suggestions
router.post("/suggestions", async (req, res) => {
  try {
    const { advisorId, ownerId, suggestion } = req.body;

    if (!advisorId || !ownerId || !suggestion) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    const rec = await Recommendation.create({
      advisorId,
      ownerId,
      suggestion,
    });

    return res.status(201).json(rec);
  } catch (err) {
    console.error("Suggestion error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /api/advisor/suggestions/:ownerId
router.get("/suggestions/:ownerId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      ownerId: req.params.ownerId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Fetch suggestion error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   NOTIFICATIONS
====================================================== */

// POST /api/advisor/notifications
router.post("/notifications", async (req, res) => {
  try {
    const { advisorId, title, message } = req.body;

    if (!advisorId || !title || !message) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const notif = await Notification.create({
      advisorId,
      title,
      message,
    });

    return res.status(201).json(notif);
  } catch (err) {
    console.error("Notification create error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/advisor/notifications/:advisorId
router.get("/notifications/:advisorId", async (req, res) => {
  try {
    const list = await Notification.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Fetch notification error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/advisor/notifications/read/:id
router.put("/notifications/read/:id", async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   RISK TEST (for one owner)
====================================================== */

// GET /api/advisor/risk-test/:ownerId
router.get("/risk-test/:ownerId", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.ownerId);
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    const risk = evaluateOwnerRisk(owner);

    return res.json(risk);
  } catch (err) {
    console.error("Risk test error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   FILE UPLOAD – OWNER SHARES FILE WITH ADVISOR
====================================================== */

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "feedback"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/advisor/feedback/file
router.post("/feedback/file", upload.single("file"), async (req, res) => {
  try {
    console.log("UPLOAD /feedback/file BODY:", req.body);
    console.log("UPLOAD /feedback/file FILE:", req.file);

    const { advisorId, ownerId } = req.body;

    if (!advisorId || !ownerId) {
      return res
        .status(400)
        .json({ message: "advisorId and ownerId are required" });
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

    console.log("Created file feedback:", fb._id, "fileUrl:", fileUrl);
    res.status(201).json(fb);
  } catch (err) {
    console.error("POST /api/advisor/feedback/file error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
