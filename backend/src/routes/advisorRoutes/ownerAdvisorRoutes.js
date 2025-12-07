const express = require("express");
const router = express.Router();

const Assignment = require("../../models/Assignment");
const Owner = require("../../models/Owner");

// Create assignment
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "Missing IDs" });
    }

    const existing = await Assignment.findOne({ ownerId, advisorId });
    if (existing) {
      return res.status(400).json({ msg: "Already linked" });
    }

    const created = await Assignment.create({ ownerId, advisorId });

    return res.json({
      success: true,
      msg: "Owner linked to advisor successfully",
      assignment: created,
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Get advisor for owner
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const assignment = await Assignment.findOne({ ownerId }).lean();

    if (!assignment) {
      return res.status(404).json({ message: "No advisor assigned." });
    }

    return res.json(assignment);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete assignment
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json({ message: "Assignment removed", deleted });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// All assignments
router.get("/", async (req, res) => {
  try {
    const list = await Assignment.find().lean();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
