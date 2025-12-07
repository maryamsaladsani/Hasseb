const mongoose = require("mongoose");

const SharedBusinessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessData: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SharedBusinessData", SharedBusinessSchema);
