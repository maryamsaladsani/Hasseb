// src/routes/ManagerRoutes/User.js
const express = require("express");
const router = express.Router();

const User = require("../../models/User");          // adjust path if needed
const { sendWelcomeEmail } = require("../../utils/email");

// ---------- Helper: generate default username ----------
function generateUsername(role, fullName) {
  const year = new Date().getFullYear();

  // "Norah Fraih" -> "norah.fraih"
  const clean = fullName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")        // spaces -> dots
    .replace(/[^a-z.]/g, "");    // keep only letters and dots

  const random = Math.floor(10000 + Math.random() * 90000); // 5 digits

  return `${role}.${clean}.${year}${random}`;
}

/* =======================================================
   GET /api/users
   List all users for the manager dashboard
   (READ-ONLY: does NOT auto-change status)
======================================================= */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const mapped = users.map((u) => ({
      id: u._id.toString(),
      name: u.fullName,
      email: u.email,
      role: u.role,
      status: u.status || "inactive", // whatever is stored in DB
      createdAt:
        u.createdAt ||
        new Date(u.joinedYear || new Date().getFullYear(), 0, 1),
      lastLoginAt: u.lastLoginAt || null,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("GET /api/users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   POST /api/users
   Create a new user from the manager panel
======================================================= */
router.post("/", async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ message: "Name, email and role are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1) Email must be unique across all users
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res
        .status(409)
        .json({ message: "Email already belongs to another user." });
    }

    // 2) Auto-generate a unique username
    let username;
    let tries = 0;
    do {
      username = generateUsername(role, name);
      const existingUsername = await User.findOne({ username });
      if (!existingUsername) break;
      tries++;
    } while (tries < 5);

    if (tries === 5) {
      return res
        .status(500)
        .json({ message: "Could not generate a unique username. Try again." });
    }

    // 3) Temporary password (will be hashed by pre-save hook)
    const tempPassword = "TempPass123!";

    const user = await User.create({
      fullName: name,
      email: normalizedEmail,
      role,
      username,
      password: tempPassword,
      status: status || "inactive",
      joinedYear: new Date().getFullYear(),
    });

    // 4) Send welcome email (uses your existing email.js)
    try {
      await sendWelcomeEmail(user.email, user.fullName, user.username);
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
      // user is created, so we still return 201
    }

    return res.status(201).json({
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status || "inactive",
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("POST /api/users error:", err);

    // 5) Handle unique index errors clearly
    if (err.code === 11000 && err.keyPattern) {
      if (err.keyPattern.email) {
        return res
          .status(409)
          .json({ message: "Email already belongs to another user." });
      }
      if (err.keyPattern.username) {
        return res
          .status(409)
          .json({ message: "Generated username already exists. Try again." });
      }
    }

    return res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   ASSIGNMENT ROUTES
   - GET /api/users/owners-advisors
   - PUT /api/users/:ownerId/assign-advisor
   For manager to assign advisors to owners
======================================================= */

// list owners + advisors + each owner's current advisor
router.get("/owners-advisors", async (req, res) => {
  try {
    const owners = await User.find({ role: "owner" })
      .select("_id fullName email advisorId")
      .lean();

    const advisors = await User.find({ role: "advisor" })
      .select("_id fullName email")
      .lean();

    // map advisorId -> name
    const advisorMap = {};
    advisors.forEach((a) => {
      advisorMap[a._id.toString()] = a.fullName;
    });

    const ownersWithAdvisor = owners.map((o) => ({
      id: o._id.toString(),
      fullName: o.fullName,
      email: o.email,
      advisorId: o.advisorId ? o.advisorId.toString() : null,
      advisorName: o.advisorId
        ? advisorMap[o.advisorId.toString()] || "Unknown"
        : null,
    }));

    res.json({
      owners: ownersWithAdvisor,
      advisors: advisors.map((a) => ({
        id: a._id.toString(),
        fullName: a.fullName,
        email: a.email,
      })),
    });
  } catch (err) {
    console.error("GET /api/users/owners-advisors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// assign (or unassign) advisor for an owner
router.put("/:ownerId/assign-advisor", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { advisorId } = req.body; // can be null to unassign

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "owner") {
      return res.status(404).json({ message: "Owner not found." });
    }

    if (advisorId) {
      const advisor = await User.findById(advisorId);
      if (!advisor || advisor.role !== "advisor") {
        return res.status(400).json({ message: "Invalid advisor." });
      }
      owner.advisorId = advisor._id;
    } else {
      // unassign
      owner.advisorId = null;
    }

    await owner.save();

    return res.json({
      id: owner._id.toString(),
      advisorId: owner.advisorId ? owner.advisorId.toString() : null,
    });
  } catch (err) {
    console.error("PUT /api/users/:ownerId/assign-advisor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================================================
   PUT /api/users/:id
   Edit an existing user (name, email, role, status)
======================================================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // 1) Load the user we are editing
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2) Only check duplicate if email changed
    const normalizedEmail = email.toLowerCase().trim();
    const oldEmail = (user.email || "").toLowerCase();

    if (normalizedEmail !== oldEmail) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res
          .status(409)
          .json({ message: "Email already belongs to another user." });
      }
    }

    // 3) Apply changes
    user.fullName = name;
    user.email = normalizedEmail;
    if (role) user.role = role;
    if (typeof status === "string") user.status = status;

    // 4) Save, catching any unique-index error
    try {
      await user.save();
      console.log("UPDATED USER STATUS:", user._id.toString(), user.status);
    } catch (err) {
      if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
        return res
          .status(409)
          .json({ message: "Email already belongs to another user." });
      }
      throw err;
    }

    // 5) Return updated user
    return res.json({
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status || "inactive",
      createdAt:
        user.createdAt ||
        new Date(user.joinedYear || new Date().getFullYear(), 0, 1),
    });
  } catch (err) {
    console.error("PUT /api/users/:id error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* =======================================================
   DELETE /api/users/:id
   Delete a user
======================================================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: id });

    return res.json({ message: "User deleted", id });
  } catch (err) {
    console.error("DELETE /api/users/:id error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
