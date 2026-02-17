const express = require("express");
const controller = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);

router.get("/users", controller.getAllUsers);
router.delete("/users/:id", controller.deleteUser);

router.post("/admin/task", controller.createTask);

router.get("/student/tasks", verifyToken, controller.getStudentTasks);
router.put("/student/progress/:id", verifyToken, controller.updateProgress);

module.exports = router;
