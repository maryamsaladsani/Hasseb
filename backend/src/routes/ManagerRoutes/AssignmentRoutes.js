const express = require("express");
const router = express.Router();
const Assignment = require("../../models/Assignment");

// GET /api/assignments/owner/:ownerId
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const assignment = await Assignment.findOne({ ownerId }).lean();
    if (!assignment) {
      return res.status(404).json({ message: "No advisor assigned." });
    }
    res.json({
      ownerId: assignment.ownerId,
      advisorId: assignment.advisorId,
    });
  } catch (err) {
    console.error("GET /api/assignments/owner/:ownerId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
