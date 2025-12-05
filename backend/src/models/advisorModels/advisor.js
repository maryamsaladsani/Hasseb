const mongoose = require("mongoose");

const AdvisorSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    fullName: { type: String, required: true },
    // =====================
    // OWNERS LINKED TO ADVISOR
    // =====================
    owners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner"
      }
    ],

    activity: [
      {
        day: String,
        valueA: Number,
        valueB: Number
      }
    ],

    topRisks: [
      {
        name: String,
        msg: String,
        tags: [String],
        date: String,
        time: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Advisor", AdvisorSchema);
