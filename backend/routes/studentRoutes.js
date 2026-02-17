const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");

router.post(
  "/submission/:id",
  verifyToken,
  upload.single("file"),
  controller.uploadSubmission
);
router.get("/tasks", verifyToken, controller.getTasks);
router.put("/progress/:id", verifyToken, controller.updateProgress);
router.put("/complete/:id", verifyToken, controller.markCompleted);

module.exports = router;
