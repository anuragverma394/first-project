// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/adminController");
// const { verifyToken, verifyAdmin } = require("../middleware/auth");

// /* TASK MANAGEMENT */
// // router.post("/admin/task", verifyToken, verifyAdmin, controller.assignTask);
// // router.get("/admin/tasks", verifyToken, verifyAdmin, controller.getTasks);
// // router.delete("/admin/task/:id", verifyToken, verifyAdmin, controller.deleteTask);
// // router.put("/admin/review/:id", verifyToken, verifyAdmin, controller.reviewSubmission);
// // console.log("ADMIN ROUTES LOADED ✅");

// module.exports = router;

const express = require("express");
const router = express.Router();

const controller = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

/* ADMIN ROUTES */

router.post("/task", verifyToken, controller.createTask);
router.get("/tasks", verifyToken, controller.getAllTasks);
router.delete("/task/:id", verifyToken, controller.deleteTask);
router.put("/review/:id", verifyToken, controller.reviewSubmission);

module.exports = router;
