const pool = require("../config/db");

/* ================= GET ALL SUBMISSIONS ================= */

exports.getSubmissions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.submission,
        t.review_status,
        t.due_date,
        u.name,
        u.email
      FROM "user".tasks t
      JOIN "user".users u ON u.id = t.student_id
      WHERE t.submission IS NOT NULL
      ORDER BY t.id DESC
    `);

    res.json({
      success: true,
      submissions: result.rows,
    });

  } catch (err) {
    console.error("GET SUBMISSIONS ERROR ❌", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions ❌",
    });
  }
};

/* ================= REVIEW SUBMISSION ================= */

exports.reviewSubmission = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const allowedStatus = ["approved", "rejected", "pending"];

    /* ✅ Validate review status */
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status ❌",
      });
    }

    /* ✅ Ensure task exists AND has submission */
    const task = await pool.query(
      `SELECT id FROM "user".tasks 
       WHERE id = $1 AND submission IS NOT NULL`,
      [id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submission not found or not uploaded ❌",
      });
    }

    /* ✅ Update review status */
    const updated = await pool.query(
      `UPDATE "user".tasks 
       SET review_status = $1 
       WHERE id = $2
       RETURNING id, review_status`,
      [status, id]
    );

    res.json({
      success: true,
      message: "Review updated ✅",
      task: updated.rows[0], // ✅ useful for frontend
    });

  } catch (err) {
    console.error("REVIEW ERROR ❌", err);

    res.status(500).json({
      success: false,
      message: "Review failed ❌",
    });
  }
};

/* ================= GET ALL TASKS ================= */

exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.due_date,
        t.status,
        t.progress,
        t.review_status,
        t.submission,
        u.name,
        u.email
      FROM "user".tasks t
      JOIN "user".users u ON u.id = t.student_id
      ORDER BY t.id DESC
    `);

    res.json({
      success: true,
      tasks: result.rows,
    });

  } catch (err) {
    console.error("GET TASKS ERROR ❌", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks ❌",
    });
  }
};
first file