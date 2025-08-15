import express from "express";
import cors from 'cors';
import pool from "./db.js";
import dotenv from "dotenv";

const app = express();

dotenv.config();

// List of allowed origins
const allowedOrigins = [
  "https://admin.sunshinepreschool1-2.org",
  "https://sunshinepreschool1-2.org"
];

// ✅ Dynamic CORS origin check
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Middleware
app.use(express.json());

// Import routes
import userRoutes from "./routes/users.js";
import eventRoutes from "./routes/events.js";
import contactRoutes from "./routes/contact.js";
import tourRoutes from "./routes/tours.js";

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
