const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const pool   = require("../config/db");

/* ════════════════════════════════════════
   REGISTER
   ════════════════════════════════════════ */
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
    console.log("FULL BODY:", req.body);

    /* ✅ Basic validation */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email & Password required ❌",
      });
    }

    /* ✅ Check existing user */
    const existing = await pool.query(
      `SELECT id FROM "user".users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered ❌",
      });
    }

    /* ✅ Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ✅ SAFE DATE HANDLING */
    const safeDob =
      dob && typeof dob === "string" && dob.trim() !== "" ? dob : null;

    /* ✅ SAFE JSONB HANDLING */
    const safeQualifications = Array.isArray(qualifications)
      ? qualifications
      : [];

    console.log(
      "QUALIFICATIONS TO DB:",
      JSON.stringify(safeQualifications, null, 2)
    );

    await pool.query(
      `INSERT INTO "user".users
       (name, email, password, phone, dob, gender, address, city, state, pincode, qualifications, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        name?.trim() || null,
        email.trim(),
        hashedPassword,
        phone?.trim() || null,
        safeDob,
        gender?.trim() || null,
        address?.trim() || null,
        city?.trim() || null,
        state?.trim() || null,
        pincode?.trim() || null,

        /* ✅ JSONB SAFE */
        JSON.stringify(safeQualifications),

        role,
      ]
    );

    res.json({
      success: true,
      message: "Registered successfully ✅",
    });

  } catch (err) {
    console.error("REGISTER ERROR ❌", err.message);

    res.status(500).json({
      message: err.message, // shows real DB error
    });
  }
};

/* ════════════════════════════════════════
   LOGIN
   ════════════════════════════════════════ */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email & Password required ❌",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password, role
       FROM "user".users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found ❌",
      });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        message: "Wrong password ❌",
      });
    }

    const token = jwt.sign(
      { id: user.id,
       role: user.role },
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
    console.error("LOGIN ERROR ❌", err.message);

    res.status(500).json({
      message: "Server error ❌",
    });
  }
};

/* ════════════════════════════════════════
   GET ALL USERS
   ════════════════════════════════════════ */
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role
       FROM "user".users
       ORDER BY id DESC`
    );

    res.json({
      success: true,
      users: result.rows,
    });

  } catch (err) {
    console.error("GET USERS ERROR ❌", err.message);

    res.status(500).json({
      message: "Failed to fetch users ❌",
    });
  }
};

/* ════════════════════════════════════════
   GET STUDENT DETAILS
   ════════════════════════════════════════ */
exports.getStudentDetails = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, dob, gender,
              address, city, state, pincode,
              qualifications, role
       FROM "user".users
       WHERE LOWER(role) = 'student'
       ORDER BY id DESC`
    );

    res.json({
      success: true,
      students: result.rows,
    });

  } catch (err) {
    console.error("GET STUDENT DETAILS ERROR ❌", err.message);

    res.status(500).json({
      message: "Failed to fetch student details ❌",
    });
  }
};

/* ════════════════════════════════════════
   DELETE USER
   ════════════════════════════════════════ */
exports.deleteUser = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM "user".users
       WHERE id = $1
       RETURNING id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found ❌",
      });
    }

    res.json({
      success: true,
      message: "User deleted ✅",
    });

  } catch (err) {
    console.error("DELETE USER ERROR ❌", err.message);

    res.status(500).json({
      message: "Delete failed ❌",
    });
  }
};

/* ════════════════════════════════════════
   CREATE TASK
   ════════════════════════════════════════ */
exports.createTask = async (req, res) => {
  const { email, title, due_date } = req.body;

  try {
    if (!email || !title) {
      return res.status(400).json({
        message: "Email and title required ❌",
      });
    }

    const student = await pool.query(
      `SELECT id FROM "user".users WHERE email = $1`,
      [email]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found ❌",
      });
    }

    await pool.query(
      `INSERT INTO "user".tasks
       (student_id, title, due_date, status, progress, review_status)
       VALUES ($1, $2, $3, 'pending', 0, 'pending')`,
      [student.rows[0].id, title, due_date || null]
    );

    res.json({
      success: true,
      message: "Task assigned ✅",
    });

  } catch (err) {
    console.error("CREATE TASK ERROR ❌", err.message);

    res.status(500).json({
      message: "Failed to assign task ❌",
    });
  }
};
