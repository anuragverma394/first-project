
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

/*
  Server mounts this at /api/admin
  So routes here are relative — do NOT repeat /admin prefix
  ✅  POST   /api/admin/task          → assignTask
  ✅  GET    /api/admin/tasks         → getTasks
  ✅  DELETE /api/admin/task/:id      → deleteTask
  ✅  PUT    /api/admin/review/:id    → reviewSubmission
  ✅  GET    /api/admin/submissions   → getSubmissions
*/

router.post(  "/task",           verifyToken, verifyAdmin, controller.assignTask);
router.get(   "/tasks",          verifyToken, verifyAdmin, controller.getTasks);
router.delete("/task/:id",       verifyToken, verifyAdmin, controller.deleteTask);
router.put(   "/review/:id",     verifyToken, verifyAdmin, controller.reviewSubmission);
router.get(   "/submissions",    verifyToken, verifyAdmin, controller.getSubmissions);

module.exports = router;