const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
<<<<<<< Updated upstream
const userRoutes = require("./routes/userRoutes.js");
const businessDataRoutes = require("./routes/businessDataRoutes");
=======

// ROUTES
const userRoutes = require("./routes/userRoutes");
const advisorRoute = require("./routes/advisorRoutes/advisorRoute");     
const advisorTicketRoutes = require("./routes/advisorRoutes/advisorTicketRoutes");
const ownerAdvisorRoutes = require("./routes/advisorRoutes/ownerAdvisorRoutes");
const ownerRoutes = require("./routes/OwnerRoutes");
>>>>>>> Stashed changes

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

/* -----------------------------
   MIDDLEWARE
------------------------------ */
app.use(cors());
app.use(express.json());

/* -----------------------------
   ROOT MESSAGE
------------------------------ */
app.get("/", (req, res) => {
  res.send("HASEEB BACKEND is running 🚀");
});

/* -----------------------------
   USER ROUTES
------------------------------ */
app.use("/api/users", userRoutes);

/* -----------------------------
<<<<<<< Updated upstream
   BusinessData ROUTES
------------------------------ */
app.use("/api/business-data", businessDataRoutes);
=======
   ADVISOR ROUTES
   (ALL advisor functionality here)
------------------------------ */
app.use("/api/advisor", advisorRoute);  // ✔ مرة واحدة فقط

/* -----------------------------
   ADVISOR TICKET ROUTES
------------------------------ */
app.use("/api/advisor", advisorTicketRoutes);  // ✔ ما فيه تضارب هنا

/* -----------------------------
   OWNER ↔ ADVISOR LINK ROUTES
------------------------------ */
app.use("/api/link", ownerAdvisorRoutes);

/* -----------------------------
   OWNER ROUTES
------------------------------ */
app.use("/api/owner", ownerRoutes);

>>>>>>> Stashed changes
/* -----------------------------
   START SERVER
------------------------------ */
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
});
