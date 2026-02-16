
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
// const pool = require("../db");
const pool = require("../config/db");



// ================= REGISTER =================

exports.register = async (req, res) => {
  console.log("REQ BODY →", req.body);

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
    role = "student",   // ✅ DEFAULT ROLE (Correct place)
  } = req.body;

  try {
    if (!password) {
      return res.status(400).json({
        message: "Password is required ❌"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await userModel.createUser(
      name.trim(),
      email.trim(),
      hashedPassword,
      phone,
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      qualifications || [],
      role
    );

    res.json({ message: "User Registered Successfully ✅" });

  } catch (err) {
    console.error("DB ERROR ❌", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message: "Email already registered ❌"
      });
    }

    res.status(500).json({
      message: "Database Error ❌"
    });
  }
};


// ================= LOGIN =================

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "User not found ❌"
      });
    }

    const user = result.rows[0];

    // ✅ Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password ❌"
      });
    }

    // ✅ CREATE JWT TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful ✅",
      token,
      role: user.role,
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR ❌", err);

    res.status(500).json({
      message: "Server Error ❌"
    });
  }
};
