
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/studentController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

/*
  Server mounts this at /api/student
  ✅  GET  /api/student/tasks            → getStudentTasks
  ✅  PUT  /api/student/progress/:id     → updateProgress
  ✅  PUT  /api/student/complete/:id     → markCompleted
  ✅  POST /api/student/upload/:id       → uploadSubmission
*/

router.get( "/tasks",          verifyToken, controller.getStudentTasks);
router.put( "/progress/:id",   verifyToken, controller.updateProgress);
router.put( "/complete/:id",   verifyToken, controller.markCompleted);
router.post("/upload/:id",     verifyToken, upload.single("file"), controller.uploadSubmission);

module.exports = router;