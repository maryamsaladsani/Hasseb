const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Feedback = require("../models/Feedback"); // adjust path

// where files will be saved
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "feedback"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/**
 * OWNER uploads a file to advisor
 * POST /api/advisor/feedback/file
 * form-data: file, ownerId, advisorId
 */
router.post(
  "/file",
  upload.single("file"),
  async (req, res) => {
    try {
      const { ownerId, advisorId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/feedback/${req.file.filename}`;

      const fb = await Feedback.create({
        ownerId,
        advisorId,
        fileUrl,
        content: "",          // advisor will add later
      });

      res.status(201).json(fb);
    } catch (err) {
      console.error("POST /api/advisor/feedback/file error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
