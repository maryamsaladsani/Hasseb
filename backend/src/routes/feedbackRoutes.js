// src/routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const Feedback = require("../models/advisorModels/Feedback");

/* =====================================================
   GET ALL FEEDBACK FOR OWNER (OWNER PANEL)
===================================================== */
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const list = await Feedback.find({ ownerId: req.params.ownerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      feedback: list
    });
  } catch (err) {
    console.error("GET OWNER FEEDBACK ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   GET ALL FEEDBACK FOR ADVISOR (ADVISOR PANEL)
===================================================== */
router.get("/advisor/:advisorId", async (req, res) => {
  try {
    const list = await Feedback.find({ advisorId: req.params.advisorId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      feedback: list
    });
  } catch (err) {
    console.error("GET ADVISOR FEEDBACK ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ADVISOR CREATES FEEDBACK FOR OWNER
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { advisorId, ownerId, content } = req.body;

    if (!advisorId || !ownerId || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const fb = await Feedback.create({ advisorId, ownerId, content });

    return res.json({ success: true, feedback: fb });
  } catch (err) {
    console.error("CREATE FEEDBACK ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   DELETE FEEDBACK
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    return res.json({ success: true, deleted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   UPDATE FEEDBACK
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { content } = req.body;

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    return res.json({ success: true, updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
