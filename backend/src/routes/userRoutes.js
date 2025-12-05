const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Advisor = require("../models/advisorModels/advisor");
const Owner = require("../models/Owner");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../utils/email");
const {sendPasswordChangedEmail} = require('../utils/email')
// Password strength regex
const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Generate unique username
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
      joinedYear: year
    });

    await newUser.save();

    // ⭐ SEND WELCOME EMAIL HERE
    await sendWelcomeEmail(newUser.email, newUser.fullName, newUser.username);

    let advisorRecord = null;
    let ownerRecord = null;

    if (role === "advisor") {
      advisorRecord = await Advisor.create({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        points: 320,
        level: 1,
        activity: [
          { day: "Sat", valueA: 450, valueB: 320 },
          { day: "Sun", valueA: 300, valueB: 150 },
          { day: "Mon", valueA: 200, valueB: 280 },
          { day: "Tue", valueA: 480, valueB: 200 },
          { day: "Wed", valueA: 120, valueB: 180 },
          { day: "Thu", valueA: 350, valueB: 290 },
          { day: "Fri", valueA: 260, valueB: 210 }
        ],
        topRisks: [
          {
            name: "Norah",
            msg: "Low cash buffer",
            tags: ["Medium"],
            date: "23 Mar 2024",
            time: "12:45 PM"
          },
          {
            name: "Rakib",
            msg: "High variable costs",
            tags: ["High priority"],
            date: "23 Mar 2024",
            time: "1:30 PM"
          }
        ],
        owners: []
      });
    }

    if (role === "owner") {
      ownerRecord = await Owner.create({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        businessName: "",
        advisor: null
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
        advisorId: advisorRecord ? advisorRecord._id : null,
        ownerId: ownerRecord ? ownerRecord._id : null
      }
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

     //  mark as active & record last login time
      user.status = "active";
      user.lastLoginAt = new Date();
      await user.save();

    let advisor = null;
    let owner = null;

    if (user.role === "advisor") advisor = await Advisor.findById(user._id);
    if (user.role === "owner") owner = await Owner.findById(user._id);

    return res.json({
      msg: "Login successful",
      user: {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        userId: user._id,
        advisorId: advisor ? advisor._id : null,
        ownerId: owner ? owner._id : null
      }
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

    // Strong password validation (same as signup)
    const strongPasswordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPasswordRegex.test(newPassword))
      return res.status(400).json({
        msg: "Weak password — must contain uppercase, lowercase, number, and symbol"
      });

    // Find user
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({ msg: "Invalid user" });

    // Update password — hashing happens automatically in your model
    user.password = newPassword;
    await user.save();
    
    // ⭐ Send password changed email
    await sendPasswordChangedEmail(user.email, user.fullName);
    
    return res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.error("Forgot-password reset error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ===========================
      TEMP FIX — HASH MANAGER PASSWORD
   =========================== */

router.get("/fix-manager", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const managerUsername = "manager.norah.202500000";  // <-- change if needed
    const newPlainPassword = "Haseeb@2027";             // <-- the password manager should use

    // Find manager
    const user = await User.findOne({ username: managerUsername });

    if (!user) {
      return res.status(404).json({ msg: "Manager user not found" });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPlainPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({
      msg: "Manager password re-hashed successfully",
      username: user.username,
      role: user.role
    });

  } catch (err) {
    console.error("Fix manager error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
