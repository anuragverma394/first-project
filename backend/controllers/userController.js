const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

/* ================= REGISTER ================= */

exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    dob,
    gender,
    address,
    city,
    state,
    pincode,
    qualifications,
    role = "student",
  } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required ❌" });
    }

    const existingUser = await pool.query(
      `SELECT id FROM "user".users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists ❌" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `INSERT INTO "user".users
      (name, email, password, phone, dob, gender, address, city, state, pincode, qualifications, role)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        name || null,
        email,
        hashedPassword,
        phone || null,
        dob || null,
        gender || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        JSON.stringify(qualifications || []),
        role,
      ]
    );

    res.json({ success: true, message: "User Registered Successfully ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error ❌" });
  }
};

/* ================= LOGIN ================= */

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required ❌" });
    }

    const result = await pool.query(
      `SELECT id, name, email, password, role
       FROM "user".users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password ❌" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error ❌" });
  }
};

/* ================= GET USERS ================= */

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role
       FROM "user".users
       ORDER BY id DESC`
    );

    res.json({ success: true, users: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users ❌" });
  }
};

/* ================= DELETE USER ================= */

exports.deleteUser = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM "user".users WHERE id = $1`,
      [req.params.id]
    );

    res.json({ success: true, message: "User Deleted ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed ❌" });
  }
};

/* ================= CREATE TASK ================= */

exports.createTask = async (req, res) => {
  const { email, title, due_date } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT id FROM "user".users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Student not found ❌" });
    }

    const studentId = userResult.rows[0].id;

    await pool.query(
      `INSERT INTO "user".tasks (student_id, title, due_date, status, progress, review_status)
       VALUES ($1, $2, $3, 'pending', 0, 'pending')`,
      [studentId, title, due_date || null]
    );

    res.json({ success: true, message: "Task Assigned ✅" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to assign task ❌" });
  }
};

/* ================= GET STUDENT TASKS ================= */

exports.getStudentTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "user".tasks
       WHERE student_id = $1
       ORDER BY id DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load tasks ❌" });
  }
};

/* ================= UPDATE PROGRESS ================= */

exports.updateProgress = async (req, res) => {
  try {
    await pool.query(
      `UPDATE "user".tasks SET progress = $1 WHERE id = $2`,
      [req.body.progress, req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Progress update failed ❌" });
  }
};
