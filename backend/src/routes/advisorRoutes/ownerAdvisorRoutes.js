const express = require("express");
const router = express.Router();
const Advisor = require("../../models/advisorModels/advisor.js");
const Owner = require("../../models/Owner.js");
/* =====================================================
   LINK OWNER TO ADVISOR
===================================================== */
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "Missing IDs" });
    }

    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ msg: "Owner not found" });

    if (!advisor.owners.includes(ownerId)) {
      advisor.owners.push(ownerId);
      await advisor.save();
    }

    owner.advisor = advisorId;
    await owner.save();

    return res.json({
      msg: "Linked successfully",
      advisor,
      owner,
    });
  } catch (err) {
    console.error("Link error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* =====================================================
   ADVISOR DASHBOARD → GET OWNERS OF THIS ADVISOR
===================================================== */
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    // 1) Check if advisor exists
    const advisor = await Advisor.findById(advisorId).lean();
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    // 2) Fetch matched owners (based on owner.advisor)
    const owners = await Owner.find({ advisor: advisorId })
      .populate("businessData")
      .lean();

    return res.json({
      advisor,
      owners,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
