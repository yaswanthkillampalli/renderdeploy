const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or if origin matches your Render domain
    const allowedOrigins = [
      "http://localhost:3000", // For local dev
      "https://yaswanthproject.onrender.com",
      "https://renderdeploy-ym8g.onrender.com"
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json()); // Ensure body parsing

// Connect to MongoDB before starting the server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  // Bind to 0.0.0.0 for Render compatibility
  app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(error => {
  console.error("❌ MongoDB Connection Failed:", error.message);
  process.exit(1); // Exit if database connection fails
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/users", userRoutes);

// Health Check Route
app.get("/", (req, res) => res.send("API is running..."));