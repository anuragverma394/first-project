const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

/* TASK MANAGEMENT */
router.post("/task", verifyToken, verifyAdmin, controller.assignTask);
router.get("/tasks", verifyToken, verifyAdmin, controller.getTasks);
router.delete("/task/:id", verifyToken, verifyAdmin, controller.deleteTask);
router.put("/review/:id", verifyToken, verifyAdmin, controller.reviewSubmission);

module.exports = router;
