    const express = require("express");
    const cors = require("cors");

    const userRoutes = require("./routes/userRoutes");

    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use("/api", userRoutes); // ✅ BEST PRACTICE

    module.exports = app;

    const studentRoutes = require("./routes/studentRoutes");

    app.use(studentRoutes);

    const adminRoutes = require("./routes/adminRoutes");
    app.use("/admin", adminRoutes);