// ===============================
//  IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Core user routes
const userRoutes = require("./routes/userRoutes");

// Business Data (Excel upload + fetch)
const businessDataRoutes = require("./routes/businessDataRoutes");

// Advisor system routes
const advisorRoute = require("./routes/advisorRoutes/advisorRoute");
const advisorTicketRoutes = require("./routes/advisorRoutes/advisorTicketRoutes");
const ownerAdvisorRoutes = require("./routes/advisorRoutes/ownerAdvisorRoutes");

// Owner routes
const ownerRoutes = require("./routes/OwnerRoutes");

// ===============================
//  CONFIG
// ===============================
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
//  ROOT
// ===============================
app.get("/", (req, res) => {
  res.send("HASEEB BACKEND is running 🚀");
});

// ===============================
//  USER ROUTES
// ===============================
app.use("/api/users", userRoutes);

// ===============================
//  BUSINESS DATA ROUTES
// (Excel upload & data processing)
// ===============================
app.use("/api/business-data", businessDataRoutes);

// ===============================
//  ADVISOR ROUTES
// ===============================
app.use("/api/advisor", advisorRoute);

// Advisor ticket system
app.use("/api/advisor", advisorTicketRoutes);

// Owner ↔ Advisor linking
app.use("/api/link", ownerAdvisorRoutes);

// ===============================
//  OWNER ROUTES
// ===============================
app.use("/api/owner", ownerRoutes);

// ===============================
//  START SERVER
// ===============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
});