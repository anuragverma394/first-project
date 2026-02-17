const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
// const studentRoutes = require("./routes/studentRoutes");
// const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
// app.use("/api/student", studentRoutes);
// app.use("/api/admin", adminRoutes);

app.listen(3000, () => console.log("Server running 🚀"));
