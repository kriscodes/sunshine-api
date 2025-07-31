const express = require("express");
const app = express();
const pool = require("./db");
require("dotenv").config();

// Middleware
app.use(express.json());

// Import routes
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");
const contactRoutes = require("./routes/contact");
const tourRoutes = require("./routes/tours");

// Use routes
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/contact-us", contactRoutes);
app.use("/tours", tourRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 API is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
