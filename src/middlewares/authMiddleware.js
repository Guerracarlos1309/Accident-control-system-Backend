const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");

/*
 Protect routes - Verify JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: "role" }],
    });

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  }
};

/*
  Restrict to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role.name)) {
      return res.status(403).json({
        message: `User role ${req.user?.role?.name || "unknown"} is not authorized to access this route`,
      });
    }
    next();
  };
};
