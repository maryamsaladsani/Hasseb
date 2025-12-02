// backend/src/models/BusinessData.js
const mongoose = require("mongoose");

const BusinessDataSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,  // One business data per owner
        ref: "User"
    },
    businessName: {
        type: String,
        required: true
    },

    // Sheet[1]: Contribution Margin
    // Products
    products: [
        {
            id: String,
            name: String,                // Item
            category: String,            // Value (Premium/Standard)
            pricePerUnit: Number,        // Price
            variableCostPerUnit: Number, // Variable Cost
            contributionMargin: Number,  // CM
            breakEvenUnits: Number,      // Break-Even Units
            breakEvenRevenue: Number     // Break-Even SAR
        }
    ],

    // Fixed costs
    fixedCost: {
        type: Number,
        required: true
    },

    // Sheet[2]: Cash Flow
    cashFlow: [
        {
            date: String,              // Date
            description: String,       // Description
            cashIn: Number,            // Cash In
            cashOut: Number,           // Cash Out
            netCashFlow: Number,       // Net Cash Flow
            runningBalance: Number     // Running Balance
        }
    ],

    // Sheet[3]: Pricing Sensitivity
    // Pricing scenarios
    pricingScenarios: [
        {
            scenario: String,          // Scenario
            price: Number,             // Price
            unitsSold: Number,         // Units Sold
            revenue: Number,           // Revenue
            variableCost: Number,      // Variable Cost
            contributionMargin: Number, // CM
            profit: Number             // Profit
        }
    ],

    // File metadata
    fileName: {
        type: String,
        required: true
    },

    fileSize: Number,
    uploadedAt: {
        type: Date,
        default: Date.now
    },

    // Store the raw file path
    filePath: String
});

module.exports = mongoose.model("BusinessData", BusinessDataSchema);