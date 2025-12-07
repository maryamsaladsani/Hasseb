const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Owner = require("../models/Owner");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail, sendPasswordChangedEmail } = require("../utils/email");

// Password strength
const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Generate username
function generateUsername(role, fullName, year) {
  const clean = fullName.split(" ")[0].toLowerCase();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${role}.${clean}.${year}${random}`;
}

/* ===========================
      SIGNUP
=========================== */
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role)
      return res.status(400).json({ msg: "Missing required fields" });

    if (!strongPasswordRegex.test(password))
      return res.status(400).json({ msg: "Weak password" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ msg: "Email already registered" });

    const year = new Date().getFullYear();
    const username = generateUsername(role, fullName, year);

    const newUser = new User({
      fullName,
      email,
      role,
      password,
      username,
      joinedYear: year,
    });

    await newUser.save();
    await sendWelcomeEmail(newUser.email, newUser.fullName, newUser.username);

    let ownerRecord = null;

    if (role === "owner") {
      ownerRecord = await Owner.create({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        businessName: "",
      });
    }

    return res.json({
      msg: "User created successfully",
      user: {
        fullName: newUser.fullName,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        userId: newUser._id,
        ownerId: ownerRecord ? ownerRecord._id : null,
      },
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ===========================
      LOGIN
=========================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ msg: "Missing fields" });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ msg: "Invalid username or password" });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched)
      return res.status(400).json({ msg: "Invalid username or password" });

    user.status = "active";
    user.lastLoginAt = new Date();
    await user.save();

    let owner = null;
    if (user.role === "owner") owner = await Owner.findById(user._id);

    return res.json({
      msg: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        userId: user._id,
        ownerId: owner ? owner._id : null,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ msg: "Server crashed", error: err.message });
  }
});

/* ===========================
   FORGOT PASSWORD - VERIFY
=========================== */
router.post("/forgot-password/verify", async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username)
      return res.status(400).json({ msg: "Missing email or username" });

    const user = await User.findOne({ email, username });

    if (!user)
      return res.status(400).json({ msg: "Email and username do not match any account" });

    return res.json({ msg: "Verified", userId: user._id });

  } catch (err) {
    console.error("Forgot-password verify error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ===========================
   FORGOT PASSWORD - RESET
=========================== */
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword)
      return res.status(400).json({ msg: "Missing fields" });

    if (!strongPasswordRegex.test(newPassword))
      return res.status(400).json({
        msg: "Weak password — must contain uppercase, lowercase, number, and symbol",
      });

    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({ msg: "Invalid user" });

    user.password = newPassword;
    await user.save();

    await sendPasswordChangedEmail(user.email, user.fullName);

    return res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.error("Forgot-password reset error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ============================================
   GET USER DETAILS (ONLY OWNER NOW)
============================================ */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const formatted = users.map(u => ({
      id: u._id.toString(),   
      name: u.fullName || u.username || "",  
      email: u.email,
      role: u.role,
      status: u.status || "inactive",
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users" });
  }
});


/* ===========================
   GET CURRENT USER 
=========================== */
router.get("/me", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId)
      return res.status(400).json({ msg: "Missing userId in query" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ msg: "User not found" });

    let owner = null;
    if (user.role === "owner") {
      owner = await Owner.findById(user._id);
    }

    return res.json({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role,
      userId: user._id,
      ownerId: owner ? owner._id : null,
    });

  } catch (err) {
    console.error("/me error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ===========================
   FIX MANAGER PASSWORD
=========================== */
router.get("/fix-manager", async (req, res) => {
  try {
    const managerUsername = "manager.norah.202500000";
    const newPlainPassword = "Haseeb@2027";

    const user = await User.findOne({ username: managerUsername });
    if (!user) return res.status(404).json({ msg: "Manager user not found" });

    const hashed = await bcrypt.hash(newPlainPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({
      msg: "Manager password re-hashed successfully",
      username: user.username,
      role: user.role,
    });

  } catch (err) {
    console.error("Fix manager error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
