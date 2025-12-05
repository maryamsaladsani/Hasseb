// backend/src/models/Scenario.js

const mongoose = require("mongoose");

const pricingScenarioSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // owner username
    productId: { type: String, required: true },
    productName: { type: String, required: true },

    newPrice: { type: Number, required: true },
    variableCost: { type: Number, required: true },
    fixedCostPerUnit: { type: Number, required: true },

    profitPerUnit: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },

    timestamp: { type: Date, default: Date.now },
  },
  {
    // Final collection name used in MongoDB
    collection: "pricingSenarios",
  }
);

// Final model export
module.exports = mongoose.model("PricingScenario", pricingScenarioSchema);
