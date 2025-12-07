const mongoose = require("mongoose");

const sharedSimulationSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  healthScore: Number,

  cashInsights: {
    realBurnRate: Number,
    dangerMonths: Number,
    firstDangerMonth: String
  },

  bepInsights: [
    {
      product: String,
      message: String,
      issue: Boolean,
      breakEvenUnits: Number
    }
  ],

  pricingInsights: [
    {
      product: String,
      margin: Number,
      opportunity: String
    }
  ],

  recommendations: [String],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SharedSimulation", sharedSimulationSchema);
