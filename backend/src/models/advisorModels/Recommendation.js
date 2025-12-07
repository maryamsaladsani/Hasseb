const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    advisorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    // Owner is OPTIONAL for general recommendations
    ownerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },

    // Scenario is OPTIONAL for general recommendations
    scenarioId: { 
      type: mongoose.Schema.Types.ObjectId, 
      default: null 
    },

    text: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", RecommendationSchema);
