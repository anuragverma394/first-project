const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api", userRoutes);

app.listen(3000, () =>
  console.log("Server running on port 3000 🚀")
);
