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
    if (!password) {
      return res.status(400).json({ message: "Password required ❌" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `INSERT INTO "user".users
      (name, email, password, phone, dob, gender, address, city, state, pincode, qualifications, role)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        name,
        email,
        hashedPassword,
        phone,
        dob,
        gender,
        address,
        city,
        state,
        pincode,
        JSON.stringify(qualifications || []),
        role,
      ]
    );

    res.json({ message: "User Registered Successfully ✅" });

  } catch (err) {
    console.error("REGISTER ERROR ❌", err);

    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already exists ❌" });
    }

    res.status(500).json({ message: "Database Error ❌" });
  }
};

/* ================= LOGIN ================= */

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM "user".users WHERE email = $1`,
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
      user,
      role: user.role,
    });

  } catch (err) {
    console.error("LOGIN ERROR ❌", err);
    res.status(500).json({ message: "Server Error ❌" });
  }
};

/* ================= GET USERS (ADMIN) ================= */

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, role 
       FROM "user".users 
       ORDER BY id DESC`
    );

    res.json({ users: result.rows });

  } catch (err) {
    console.error("FETCH USERS ERROR ❌", err);
    res.status(500).json({ message: "Failed to fetch users ❌" });
  }
};

/* ================= DELETE USER ================= */

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `DELETE FROM "user".users WHERE id = $1`,
      [id]
    );

    res.json({ message: "User Deleted ✅" });

  } catch (err) {
    console.error("DELETE ERROR ❌", err);
    res.status(500).json({ message: "Delete failed ❌" });
  }
};
