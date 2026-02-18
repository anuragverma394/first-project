
const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();

const userRoutes    = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes   = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

/* ✅ Serve uploaded files as static */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
  Route mounting:
  /api            → register, login, users, students (userRoutes)
  /api/student    → student task actions            (studentRoutes)
  /api/admin      → admin task/submission actions   (adminRoutes)
*/
app.use("/api",         userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin",   adminRoutes);

/* ✅ 404 fallback */
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));