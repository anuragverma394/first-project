
const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/userController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

/* ── AUTH (public) ── */
router.post("/register", controller.register);
router.post("/login",    controller.login);


/* ── USER MANAGEMENT (admin only) ── */
router.get(   "/users",     verifyToken, verifyAdmin, controller.getAllUsers);
router.delete("/users/:id", verifyToken, verifyAdmin, controller.deleteUser);

/* ── FULL STUDENT DETAILS with all DB columns (admin only) ── */
router.get("/students", verifyToken, verifyAdmin, controller.getStudentDetails);

/* ── TASK CREATION via userController (admin only) ── */
router.post("/admin/task", verifyToken, verifyAdmin, controller.createTask);

/* SESSION RECOVERY */
router.get("/me", verifyToken, controller.getCurrentUser);
// In userRoutes.js
module.exports = router;