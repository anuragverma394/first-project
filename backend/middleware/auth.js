
const jwt = require("jsonwebtoken");

/* ✅ VERIFY TOKEN — reads Bearer token from Authorization header */
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided ❌" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("JWT ERROR ❌", err.message);
    return res.status(401).json({ message: "Invalid or expired token ❌" });
  }
};

/* ✅ VERIFY ADMIN — case-insensitive so 'admin', 'Admin', 'ADMIN' all pass */
exports.verifyAdmin = (req, res, next) => {
  if (req.user?.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admin only ❌" });
  }
  next();
};