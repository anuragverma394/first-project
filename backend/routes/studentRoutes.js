// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/studentController");
// const verifyToken = require("../middleware/verifyToken");
// const upload = require("../middleware/upload");

// router.post(
//   "/submission/:id",
//   verifyToken,
//   upload.single("file"),
//   controller.uploadSubmission
// );
// router.get("/tasks", verifyToken, controller.getTasks);
// router.put("/progress/:id", verifyToken, controller.updateProgress);
// router.put("/complete/:id", verifyToken, controller.markCompleted);

// module.exports = router;
const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const { verifyToken } = require("../middleware/auth");

router.get("/tasks", verifyToken, studentController.getStudentTasks);
router.put("/progress/:id", verifyToken, studentController.updateProgress);
router.put("/complete/:id", verifyToken, studentController.markCompleted);

module.exports = router;
