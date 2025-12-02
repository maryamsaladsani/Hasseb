const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const BusinessData = require("../models/BusinessData");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload business data
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                msg: "No file uploaded"
            });
        }

        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                msg: "Username is required"
            });
        }

        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!sheet || sheet.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "Excel file is empty or improperly formatted"
            });
        }

        // Extract data (assuming first row has the data)
        const row = sheet[0];
        const businessData = {
            username,
            businessName: row["Business Name"] || row.businessName || "My Business",
            fixedCosts: parseFloat(row["Fixed Costs"] || row.fixedCosts || 0),
            variableCostPerUnit: parseFloat(row["Variable Cost Per Unit"] || row.variableCostPerUnit || 0),
            sellingPricePerUnit: parseFloat(row["Selling Price Per Unit"] || row.sellingPricePerUnit || 0)
        };

        // Validation
        if (!businessData.fixedCosts || !businessData.variableCostPerUnit || !businessData.sellingPricePerUnit) {
            return res.status(400).json({
                success: false,
                msg: "Missing required fields in Excel file"
            });
        }

        // Update or create business data
        const updatedData = await BusinessData.findOneAndUpdate(
            { username },
            businessData,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            msg: "Business data uploaded successfully",
            data: updatedData
        });

    } catch (err) {
        console.error("🔥 Upload error:", err);
        return res.status(500).json({
            success: false,
            msg: "Server error",
            error: err.message
        });
    }
});

// Get business data by username
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const businessData = await BusinessData.findOne({ username });

        if (!businessData) {
            return res.status(404).json({
                success: false,
                msg: "No business data found for this user"
            });
        }

        return res.status(200).json({
            success: true,
            data: businessData
        });

    } catch (err) {
        console.error("🔥 Fetch error:", err);
        return res.status(500).json({
            success: false,
            msg: "Server error",
            error: err.message
        });
    }
});

module.exports = router;