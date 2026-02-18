
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

    res.json({ success: true, submissions: result.rows });

              } catch (err) {
              console.error("GET SUBMISSIONS ERROR ❌", err);
              res.status(500).json({ success: false, message: "Failed to fetch submissions ❌" });
              }
    };

/* ================= REVIEW SUBMISSION ================= */

exports.reviewSubmission = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const allowedStatus = ["approved", "rejected", "pending"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid review status ❌" });
    }

    const task = await pool.query(
      `SELECT id FROM "user".tasks WHERE id = $1 AND submission IS NOT NULL`,
      [id]
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found or not uploaded ❌" });
    }

    const updated = await pool.query(
      `UPDATE "user".tasks SET review_status = $1 WHERE id = $2 RETURNING id, review_status`,
      [status, id]
    );

    res.json({ success: true, message: "Review updated ✅", task: updated.rows[0] });

  } catch (err) {
    console.error("REVIEW ERROR ❌", err);
    res.status(500).json({ success: false, message: "Review failed ❌" });
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

    res.json({ success: true, tasks: result.rows });

  } catch (err) {
    console.error("GET TASKS ERROR ❌", err);
    res.status(500).json({ success: false, message: "Failed to fetch tasks ❌" });
  }
};

/* ================= ASSIGN TASK ================= */

exports.assignTask = async (req, res) => {
  const { email, title, due_date } = req.body;

  try {
    if (!email || !title) {
      return res.status(400).json({ success: false, message: "Email and title are required ❌" });
    }

    const userResult = await pool.query(
      `SELECT id FROM "user".users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found ❌" });
    }

    const studentId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO "user".tasks (student_id, title, due_date, status, progress, review_status)
       VALUES ($1, $2, $3, 'pending', 0, 'pending')`,
      [studentId, title, due_date || null]
    );

    res.json({ success: true, message: "Task Assigned ✅" });

  } catch (err) {
    console.error("ASSIGN TASK ERROR ❌", err);
    res.status(500).json({ success: false, message: "Failed to assign task ❌" });
  }
};

/* ================= DELETE TASK ================= */

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM "user".tasks WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found ❌" });
    }

    res.json({ success: true, message: "Task deleted ✅" });

  } catch (err) {
    console.error("DELETE TASK ERROR ❌", err);
    res.status(500).json({ success: false, message: "Failed to delete task ❌" });
  }
};