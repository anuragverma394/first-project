const pool = require("../config/db");

exports.createUser = async (
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
  qualifications,
  role
) => {
  return pool.query(
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
      JSON.stringify(qualifications || []) ,
      role || "student" // ✅ SAFE DEFAULT
    ]
  );
};
