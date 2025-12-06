const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    const items = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json(items);
  } catch (err) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    console.error("GET /notifications/unread-count error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ ok: true });
  } catch (err) {
    console.error("POST /notifications/:id/read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/mark-all-read", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ msg: "userId is required" });
    }

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("POST /notifications/mark-all-read error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
