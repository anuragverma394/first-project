const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ All routes clearly prefixed
app.use("/api", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
