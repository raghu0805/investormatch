import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication token missing or malformed",
      code: "TOKEN_MISSING"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || 'DEFAULT_INVESTMATCH_SECRET';
    const decoded = jwt.verify(token, secret);

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(403).json({
      success: false,
      error: "Invalid authentication token",
      code: "INVALID_TOKEN",
      details: err.message
    });
  }
};

export default authMiddleware;