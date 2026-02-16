// require("dotenv").config();
// const app = require("./app");

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT} 🚀`);
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ VERY IMPORTANT
app.use(userRoutes);

app.listen(3000, () => console.log("Server running on port 3000 ✅"));
