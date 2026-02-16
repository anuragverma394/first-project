const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Mydatabase",
  password: "root",
  port: 5432,
});

/* ✅ SAFE CONNECTION TEST */
pool.query("SELECT 1")
  .then(() => console.log("Database Connected ✅"))
  .catch((err) => console.error("DB Connection Error ❌", err));

module.exports = pool;
