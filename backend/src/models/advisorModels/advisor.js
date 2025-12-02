const mongoose = require("mongoose");

const AdvisorSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  fullName: { type: String, required: true },
  username: { type: String, required: true },

  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },

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
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Advisor", AdvisorSchema);
