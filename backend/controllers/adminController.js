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
        u.name,
        u.email
      FROM tasks t
      JOIN "user".users u ON u.id = t.user_id
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
    /* ✅ Validate status */
    const allowedStatus = ["approved", "rejected", "pending"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status ❌",
      });
    }

    /* ✅ Check task exists */
    const task = await pool.query(
      `SELECT id FROM tasks WHERE id = $1`,
      [id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found ❌",
      });
    }

    /* ✅ Update review */
    await pool.query(
      `UPDATE tasks SET review_status = $1 WHERE id = $2`,
      [status, id]
    );

    res.json({
      success: true,
      message: "Review updated ✅",
    });

  } catch (err) {
    console.error("REVIEW ERROR ❌", err);

    res.status(500).json({
      success: false,
      message: "Review failed ❌",
    });
  }
};
