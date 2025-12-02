const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Advisor = require("../models/advisorModels/advisor");
const Owner = require("../models/Owner");
const bcrypt = require("bcryptjs");

// Password strength regex
const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Generate unique username
function generateUsername(role, fullName, year) {
  const clean = fullName.replace(/\s+/g, "").toLowerCase();
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

    // Create user in Users collection
    const newUser = new User({
      fullName,
      email,
      role,
      password,
      username,
      joinedYear: year
    });

    await newUser.save(); // password hashing happens automatically

    let advisorRecord = null;
    let ownerRecord = null;

    /* ===========================
        If Advisor → create profile
    ============================ */
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

    /* ===========================
        If Owner → create profile
    ============================ */
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

module.exports = router;
