const express = require("express");
const router = express.Router();
const Assignment = require("../../models/Assignment");


router.get("/", async (req, res) => {
  try {
    const list = await Assignment.find().lean();
    return res.json(list);
  } catch (err) {
    console.error("GET /api/assignments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { advisorId, ownerId } = req.body;

    if (!advisorId || !ownerId) {
      return res
        .status(400)
        .json({ message: "advisorId and ownerId are required" });
    }

    // avoid duplicates
    const existing = await Assignment.findOne({ advisorId, ownerId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "This advisor is already assigned to this owner." });
    }

    const created = await Assignment.create({ advisorId, ownerId });
    return res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/assignments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Assignment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    return res.json({ message: "Assignment removed", deleted });
  } catch (err) {
    console.error("DELETE /api/assignments/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const assignment = await Assignment.findOne({ ownerId }).lean();

    if (!assignment) {
      return res.status(404).json({ message: "No advisor assigned." });
    }

    return res.json(assignment);
  } catch (err) {
    console.error("GET /api/assignments/owner/:ownerId error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
