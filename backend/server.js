const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");
const metrics = require("./metrics");
const { startSimulator } = require("./services/bookingSimulator");

dotenv.config();

// Connect Database & Run Seed
connectDB().then(() => {
  const { seedDatabase } = require("./controllers/serviceController");
  seedDatabase();
});

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("HomeEase Backend Running");
});

// Health check endpoint - used by Docker, ALB, and ECS
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "homeease-backend", timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metrics.client.register.contentType);
  res.end(await metrics.client.register.metrics());
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/emergency", require("./routes/emergencyRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the booking simulator for Prometheus metrics
  startSimulator();
});