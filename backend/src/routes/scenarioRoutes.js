// backend/src/routes/scenarioRoutes.js

const express = require("express");
const router = express.Router();

// Correct model import
const PricingScenario = require("../models/Scenario");

// ===============================
//  CREATE SCENARIO
// ===============================
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.username) {
      return res.status(400).json({
        success: false,
        message: "username is required",
      });
    }

    const scenario = await PricingScenario.create(payload);

    return res.status(201).json({
      success: true,
      message: "Scenario saved successfully",
      scenario,
    });
  } catch (err) {
    console.error("🔥 Error saving pricing scenario:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save scenario",
    });
  }
});

// ===============================
//  GET SCENARIOS BY USERNAME
// ===============================
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const scenarios = await PricingScenario.find({ username }).sort({
      timestamp: -1,
    });

    return res.json({
      success: true,
      scenarios,
    });
  } catch (err) {
    console.error("🔥 Error fetching pricing scenarios:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scenarios",
    });
  }
});

module.exports = router;