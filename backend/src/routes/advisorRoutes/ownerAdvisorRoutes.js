const express = require("express");
const router = express.Router();

const Owner = require("../../models/Owner");
const Advisor = require("../../models/advisorModels/advisor");

/* ===========================
   OWNER ↔ ADVISOR LINK
=========================== */
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "ownerId and advisorId are required" });
    }

    // Check advisor exists
    const advisor = await Advisor.findById(advisorId);
    if (!advisor) {
      return res.status(404).json({ msg: "Advisor not found" });
    }

    // Check owner exists
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ msg: "Owner not found" });
    }

    // Link owner → advisor
    owner.advisor = advisorId;
    await owner.save();

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
