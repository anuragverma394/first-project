// const express = require("express");
// const controller = require("../controllers/userController");


// const router = express.Router();

// router.post("/register", controller.register);
// router.post("/login", controller.login);     
// module.exports = router;
const express = require("express");
const controller = require("../controllers/userController");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/users", controller.getAllUsers);
router.delete("/users/:id", controller.deleteUser);

module.exports = router;
