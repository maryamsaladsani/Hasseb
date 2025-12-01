const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
console.log('typeof connectDB:', typeof connectDB); 

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('HASEEB BACKEND is running 🚀');
});
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


// to check if it work  http://localhost:5001/

// to check if it work  http://localhost:5000/