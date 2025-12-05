const mongoose = require("mongoose");

const BusinessDataSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    businessName: { type: String, default: "My Business" },

    products: [
      {
        name: String,
        cost: Number,
        price: Number
      }
    ],

    fixedCost: { type: Number, default: 0 },

    cashFlow: [
      {
        month: String,
        revenue: Number,
        expenses: Number,
        netCashFlow: Number
      }
    ],

    pricingScenarios: [
      {
        scenario: String,  
        price: Number,
        units: Number,
        revenue: Number,
        variableCost: Number,
        cm: Number,
        profit: Number
      }
    ],

    fileName: String,
    fileSize: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessData", BusinessDataSchema);
