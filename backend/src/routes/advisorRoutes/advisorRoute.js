// backend/src/routes/advisorRoute.js
const express = require("express");
const router = express.Router();

const Advisor = require("../../models/advisorModels/advisor");
const Owner = require("../../models/Owner");
const Ticket = require("../../models/advisorModels/Ticket");
const Feedback = require("../../models/advisorModels/Feedback");
const Recommendation = require("../../models/advisorModels/Recommendation");
const Notification = require("../../models/advisorModels/Notification");
const { evaluateOwnerRisk } = require("../../utils/riskEngine");

/* ======================================================
   DEBUG — Ping route
====================================================== */
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/advisor" });
});

/* ======================================================
   GET DASHBOARD DATA (NOW WITH RISK + AUTO-NOTIFS)
====================================================== */
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    const owners = await Owner.find({ advisor: advisorId });
    const tickets = await Ticket.find({ advisorId }).sort({ createdAt: -1 });
    const feedback = await Feedback.find({ advisorId }).sort({ createdAt: -1 });

    /* ---------- RANK ---------- */
    const allAdvisors = await Advisor.find();
    const sorted = allAdvisors.sort((a, b) => b.points - a.points);
    const rank =
      sorted.findIndex((a) => a._id.toString() === advisorId) + 1;

    /* ---------- ACTIVITY MOCK ---------- */
    const activity = [
      { day: "Sat", valueA: 450, valueB: 320 },
      { day: "Sun", valueA: 300, valueB: 150 },
      { day: "Mon", valueA: 200, valueB: 280 },
      { day: "Tue", valueA: 480, valueB: 200 },
      { day: "Wed", valueA: 120, valueB: 180 },
      { day: "Thu", valueA: 350, valueB: 290 },
      { day: "Fri", valueA: 260, valueB: 210 },
    ];

    /* ---------- STATIC DASHBOARD ALERTS ---------- */
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

    /* ======================================================
       ⭐ 1) RUN RISK ENGINE FOR EACH OWNER
    ======================================================= */
    const rawRiskData = owners.map((o) => evaluateOwnerRisk(o));

    /* ======================================================
       ⭐ 2) FILTER ALERTS BASED ON NUMBER OF OWNERS
          - If <= 3 owners → return ALL alerts
          - If > 3 owners → return ONLY High → else Medium → else Info
    ======================================================= */
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

    /* ======================================================
       ⭐ 3) AUTO-NOTIFICATIONS FOR HIGH RISK OWNERS
    ======================================================= */
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

    /* ======================================================
       ⭐ RETURN EVERYTHING
    ======================================================= */
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
      riskData: rawRiskData, // كامل
      filteredRisk, // اللي نعرضه في الواجهة
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   ADD FEEDBACK
====================================================== */
router.post("/feedback", async (req, res) => {
  try {
    const { advisorId, ownerId, content } = req.body;

    if (!advisorId || !ownerId || !content)
      return res.status(400).json({ msg: "Missing fields" });

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    const fb = await Feedback.create({
      advisorId,
      ownerId,
      ownerName: owner.fullName,
      content,
    });

    return res.json(fb);
  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   GET FEEDBACK FOR ADVISOR
====================================================== */
router.get("/feedback/:advisorId", async (req, res) => {
  try {
    const list = await Feedback.find({ advisorId: req.params.advisorId }).sort({
      createdAt: -1,
    });

    return res.json(list);
  } catch (err) {
    console.error("Feedback fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   DELETE FEEDBACK
====================================================== */
router.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Feedback not found" });
    }

    return res.json({ msg: "Feedback deleted", deleted });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   UPDATE FEEDBACK
====================================================== */
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
    console.error("Update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   SAVE SUGGESTION
====================================================== */
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

/* ======================================================
   GET SUGGESTIONS
====================================================== */
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
   CREATE NOTIFICATION
====================================================== */
router.post("/notifications", async (req, res) => {
  try {
    const { advisorId, title, message } = req.body;

    if (!advisorId || !title || !message)
      return res.status(400).json({ msg: "Missing fields" });

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

/* ======================================================
   GET NOTIFICATIONS FOR ADVISOR
====================================================== */
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

/* ======================================================
   MARK NOTIFICATION AS READ
====================================================== */
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
   TEST RISK FOR ONE OWNER
====================================================== */
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

module.exports = router;
