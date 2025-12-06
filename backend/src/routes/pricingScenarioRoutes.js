const express = require("express");
const router = express.Router();

const BusinessData = require("../models/BusinessData");

/* ===============================================
   CREATE NEW PRICING SCENARIO
================================================ */
router.post("/", async (req, res) => {
  try {
    const {
      ownerId,
      productId,
      productName,
      newPrice,
      variableCost,
      fixedCostPerUnit,
      profitPerUnit,
      profitMargin,
      totalProfit,
      totalRevenue,
      timestamp,
    } = req.body;

    if (!ownerId) {
      return res.json({ success: false, message: "ownerId is required" });
    }

    const business = await BusinessData.findOne({ owner: ownerId });
    if (!business) {
      return res.json({ success: false, message: "BusinessData not found" });
    }

    const scenario = {
      productId,
      productName,
      scenarioName: `Scenario - ${productName}`,
      newPrice,
      variableCost,
      fixedCostPerUnit,
      profitPerUnit,
      profitMargin,
      totalProfit,
      totalRevenue,
      breakEvenSales: totalRevenue,
      breakEvenUnits: Math.ceil(totalRevenue / newPrice),
      createdAt: timestamp || Date.now(),
    };

    business.scenarios.push(scenario);
    await business.save();

    return res.json({ success: true, scenario });

  } catch (err) {
    console.error("SAVE SCENARIO ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


/* ===============================================
   GET SCENARIOS BY OWNER
================================================ */
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const business = await BusinessData.findOne({ owner: ownerId });

    if (!business) {
      return res.json({ success: true, scenarios: [] });
    }

    return res.json({
      success: true,
      scenarios: business.scenarios || [],
    });

  } catch (err) {
    console.error("GET SCENARIOS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
