const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 */
exports.generateToken = (id, expiresIn = "7d") => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Generate Refresh Token
 * NOTE: JWT_REFRESH_SECRET must be set in environment for secure refresh tokens.
 * If JWT_REFRESH_SECRET is missing, fallback to JWT_SECRET is NOT recommended and will throw an error.
 */
exports.generateRefreshToken = (payload) => {
  const secret =
    process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_REFRESH_SECRET or REFRESH_TOKEN_SECRET is not set in environment."
    );
  }

  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

  // Ensure payload is a plain object
  const plainPayload = {
    id: payload.id || payload._id,
    role: payload.role,
    userType: payload.userType,
  };

  return jwt.sign(plainPayload, secret, { expiresIn });
};

/**
 * Generate Access Token
 */
exports.generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment.");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  // Ensure payload is a plain object
  const plainPayload = {
    id: payload.id || payload._id,
    role: payload.role,
    userType: payload.userType,
  };

  return jwt.sign(plainPayload, secret, { expiresIn });
};

/**
 * Verify Token
 */
exports.verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  if (!token) {
    throw new Error("Token is required for verification");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Re-throw original JWT error so error.name/type is preserved
    throw error;
  }
};

/**
 * Verify Refresh Token
 */
exports.verifyRefreshToken = (token) => {
  if (!token) {
    throw new Error("Refresh token is required for verification");
  }
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    throw new Error(
      "JWT_REFRESH_SECRET is not set. Please set JWT_REFRESH_SECRET in your environment."
    );
  }
  try {
    return jwt.verify(token, refreshSecret);
  } catch (error) {
    // Re-throw original JWT error so error.name/type is preserved
    throw error;
  }
};
