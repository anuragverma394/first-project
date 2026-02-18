
const pool = require("../config/db");

/* ✅ GET TASKS FOR LOGGED-IN STUDENT */
exports.getStudentTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM "user".tasks
       WHERE student_id = $1
       ORDER BY id DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error("GET TASKS ERROR ❌", err);
    res.status(500).json({ message: "Failed to fetch tasks ❌" });
  }
};

/* ✅ UPDATE PROGRESS */
exports.updateProgress = async (req, res) => {
  const { progress } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "user".tasks
       SET progress = $1
       WHERE id = $2 AND student_id = $3
       RETURNING id`,
      [progress, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found ❌" });
    }

    res.json({ success: true, message: "Progress updated ✅" });

  } catch (err) {
    console.error("UPDATE PROGRESS ERROR ❌", err);
    res.status(500).json({ message: "Update failed ❌" });
  }
};

/* ✅ MARK COMPLETED */
exports.markCompleted = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE "user".tasks
       SET status = 'completed', progress = 100
       WHERE id = $1 AND student_id = $2
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found ❌" });
    }

    res.json({ success: true, message: "Task completed ✅" });

  } catch (err) {
    console.error("MARK COMPLETED ERROR ❌", err);
    res.status(500).json({ message: "Failed ❌" });
  }
};

/* ✅ SAVE SUBMISSION */
exports.uploadSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded ❌" });
    }

    const result = await pool.query(
      `UPDATE "user".tasks
       SET submission = $1, review_status = 'pending'
       WHERE id = $2 AND student_id = $3
       RETURNING id`,
      [req.file.filename, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found ❌" });
    }

    res.json({ success: true, message: "Submission uploaded ✅" });

  } catch (err) {
    console.error("UPLOAD ERROR ❌", err);
    res.status(500).json({ message: "Upload failed ❌" });
  }
};