const pool = require("../config/db");

/* ✅ GET TASKS FOR LOGGED-IN STUDENT */
exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/* ✅ UPDATE PROGRESS */
exports.updateProgress = async (req, res) => {
  const { progress } = req.body;

  try {
    await pool.query(
      `UPDATE tasks SET progress = $1 WHERE id = $2`,
      [progress, req.params.id]
    );

    res.json({ message: "Progress updated ✅" });

  } catch (err) {
    res.status(500).json({ message: "Update failed ❌" });
  }
};

/* ✅ MARK COMPLETED */
exports.markCompleted = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tasks SET status = 'completed', progress = 100 WHERE id = $1`,
      [req.params.id]
    );

    res.json({ message: "Task completed ✅" });

  } catch {
    res.status(500).json({ message: "Failed ❌" });
  }
};

/* ✅ SAVE SUBMISSION */
exports.uploadSubmission = async (req, res) => {
  try {
    await pool.query(
      `UPDATE tasks SET submission = $1, review_status = 'pending'
       WHERE id = $2`,
      [req.file.filename, req.params.id]
    );

    res.json({ message: "Submission uploaded ✅" });

  } catch {
    res.status(500).json({ message: "Upload failed ❌" });
  }
};
