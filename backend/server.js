// ===============================
//  IMPORTS
// ===============================
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const path = require("path");




// Core routes
const userRoutes = require("./src/routes/userRoutes");
const businessDataRoutes = require("./src/routes/businessDataRoutes");
const advisorRoute = require("./src/routes/advisorRoutes/advisorRoute");
const advisorTicketRoutes = require("./src/routes/advisorRoutes/advisorTicketRoutes");
const ownerAdvisorRoutes = require("./src/routes/advisorRoutes/ownerAdvisorRoutes");
const ownerRoutes = require("./src/routes/OwnerRoutes");
const scenarioRoutes = require("./src/routes/scenarioRoutes"); 
const managerUserRoutes = require("./src/routes/ManagerRoutes/User");
const ticketRoutes = require("./src/routes/ManagerRoutes/TicketRoutes");
const assignmentRoutes = require("./src/routes/ManagerRoutes/AssignmentRoutes");
const notificationRoutes = require("./src/routes/NotificationRoutes");

// ===============================
//  CONFIG
// ===============================
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
//  ROUTES
// ===============================
app.use("/api/users", userRoutes);
app.use("/api/business-data", businessDataRoutes);
app.use("/api/advisor", advisorRoute);
app.use("/api/advisor", advisorTicketRoutes);
app.use("/api/link", ownerAdvisorRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/pricing-scenarios", scenarioRoutes);
app.use("/api/users", managerUserRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/assignments", assignmentRoutes);
// serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));
app.use("/api/notifications", notificationRoutes);
// ===============================
//  START SERVER
// ===============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
});
