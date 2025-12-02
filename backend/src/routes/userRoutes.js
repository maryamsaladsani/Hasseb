const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Strong password regex — at least:
// 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// Create unique username for the user
function generateUsername(role, fullName, year) {
    const cleanName = fullName.replace(/\s+/g, "").toLowerCase();
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // 5 digits
    return `${role}.${cleanName}.${year}${randomNumber}`;
}

/* ------------------------------------
   SIGNUP
------------------------------------- */
router.post("/signup", async (req, res) => {
    console.log("📥 Received signup request:", req.body);

    try {
        const { fullName, email, password, role } = req.body;

        console.log("⭐ Extracted fields:", { fullName, email, role });

        if (!fullName || !email || !password || !role) {
            console.log("❌ Missing field");
            return res.status(400).json({ msg: "Missing required fields" });
        }

        if (!strongPasswordRegex.test(password)) {
            console.log("❌ Weak password");
            return res.status(400).json({ msg: "Weak password" });
        }

        const existing = await User.findOne({ email });

        if (existing) {
            console.log("❌ Email already exists");
            return res.status(400).json({ msg: "Email already registered" });
        }

        const year = new Date().getFullYear();
        const username = generateUsername(role, fullName, year);

        console.log("⭐ Creating new user with username:", username);

        const newUser = new User({
            fullName,
            email,
            role,
            password,
            username,
            joinedYear: year
        });

        await newUser.save();

        console.log("✅ User saved successfully");

        return res.json({
            msg: "User created successfully",
            user: {
                fullName,
                email,
                username,
                role
            }
        });

    } catch (err) {
    console.error("🔥 REAL SIGNUP ERROR:", err);
    console.error("📌 err.message:", err.message);
    console.error("📌 err.code:", err.code);
    console.error("📌 err.keyValue:", err.keyValue);
    console.error("📌 err.errors:", err.errors);

    return res.status(500).json({
        msg: "Server error",
        error: err.message
    });
}

});
/* ------------------------------------
   LOGIN
------------------------------------- */
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: "Invalid username or password" });
        }

        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
            return res.status(400).json({ msg: "Invalid username or password" });
        }

        res.json({
            msg: "Login successful",
            user: {
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ msg: "Server error" });
    }
});

// TEMP ROUTE: Fix manager user (username + password)
router.post("/fix-manager", async (req, res) => {
    try {
        // Find the manager by email (adjust if you used a different one)
        const user = await User.findOne({ email: "haseeb@manager.com" });

        if (!user) {
            return res.status(404).json({ msg: "Manager user not found" });
        }

        // Force correct username + plain text password.
        // The pre-save hook in User.js WILL hash this when saving.
        user.username = "manager.norah.202500000"; // all lowercase, matches login
        user.password = "Haseeb@2027";             // plain text, will be hashed

        await user.save();

        return res.json({
            msg: "Manager fixed successfully",
            username: user.username,
            role: user.role
        });
    } catch (err) {
        console.error("Fix manager error:", err);
        return res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;
