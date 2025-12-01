const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes.js");

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
app.get('/', (req, res) => {
    res.send('HASEEB BACKEND is running 🚀');
});

/* -----------------------------
   USER ROUTES
------------------------------ */
app.use("/api/users", userRoutes);

/* -----------------------------
   START SERVER
------------------------------ */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// to check if it work  http://localhost:5001/