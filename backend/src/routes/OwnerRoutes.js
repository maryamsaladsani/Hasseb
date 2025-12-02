const express = require("express");
const router = express.Router();

const Owner = require("../models/Owner");
const Advisor = require("../models/advisorModels/advisor");

/* ===========================
   LINK OWNER ↔ ADVISOR
=========================== */
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "ownerId and advisorId required" });
    }

    // Find advisor
    const advisor = await Advisor.findById(advisorId);
    if (!advisor) {
      return res.status(404).json({ msg: "Advisor not found" });
    }

    // Find owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ msg: "Owner not found" });
    }

    // Link owner → advisor
    owner.advisor = advisor._id;
    await owner.save();

    // Link advisor → owners list
    if (!advisor.owners.includes(owner._id)) {
      advisor.owners.push(owner._id);
      await advisor.save();
    }

    return res.json({
      msg: "Owner linked successfully",
      owner,
      advisor
    });

  } catch (err) {
    return res.status(500).json({
      msg: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
