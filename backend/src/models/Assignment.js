const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

assignmentSchema.index({ advisorId: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
