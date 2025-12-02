const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    suggestion: {
      price: Number,
      variableCost: Number,
      fixedCost: Number,
      units: Number,
      breakEvenUnits: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", RecommendationSchema);
