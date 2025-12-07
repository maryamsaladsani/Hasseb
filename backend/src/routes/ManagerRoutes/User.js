const express = require("express");
const router = express.Router();
const User = require("../../models/User");

/* =====================================================
   1) GET ALL USERS  (Manager dashboard)
===================================================== */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().lean();

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* =====================================================
   2) GET ONLY OWNERS + ADVISORS
===================================================== */
router.get("/owners-advisors", async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["owner", "advisor"] },
    }).lean();

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* =====================================================
   3) CREATE USER (Manager adds new user)
===================================================== */
router.post("/", async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const username = `${email.split("@")[0]}.${Date.now()}`;

    const user = await User.create({
      fullName: name,
      email,
      username,
      role,
      status,
      password: "Temp@1234",
    });

    res.json({
      id: user._id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   4) UPDATE USER
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        fullName: name,
        email,
        role,
        status,
      },
      { new: true }
    );

    res.json({
      id: updated._id,
      name: updated.fullName,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   5) DELETE USER
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   6) GET SINGLE USER (THIS MUST BE LAST)
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const u = await User.findById(req.params.id);

    if (!u) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: u._id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
