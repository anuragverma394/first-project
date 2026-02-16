exports.verifyAdmin = (req, res, next) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin Access Only ❌"
    });
  }

  next();
};
