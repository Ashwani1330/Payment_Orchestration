const jwt = require('jsonwebtoken');
const AuthToken = require('../models/authTokens');
const { v4: uuidv4 } = require('uuid');  // Make sure to install uuid package
const moment = require('moment-timezone');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // More reliable token extraction

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // First verify the token structure is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Check if token exists in database
    const authToken = await AuthToken.findByToken(token);
    
    if (!authToken) {
      return res.status(401).json({ 
          msg: "Token not found in database",
          code: "TOKEN_NOT_FOUND"
      });
    }

    // Check if token is expired
    if (new Date(authToken.expiresAt) < new Date()) {
      // Clean up expired tokens
      await AuthToken.removeExpiredTokens(decoded.user.id);

      // Generate new token with same user data
      const newToken = jwt.sign(
        { user: decoded.user },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Generate new UUID for the token
      const newUniqueId = uuidv4();
      
      // Calculate new expiration date in IST
      const expiresAt = moment().tz('Asia/Kolkata').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');

      // Update token in database
      await AuthToken.create(newUniqueId, decoded.user.id, newToken, expiresAt);

      // Send the new token in response headers
      res.setHeader('X-New-Token', newToken);
      
      // Continue with the request but inform client about new token
      return res.status(200).json({
        msg: "Token renewed",
        newToken: newToken,
        expiresAt: expiresAt
      });
    }

    // If we get here, token is valid and not expired
    next();
  } catch (err) {
    console.error('Auth Error:', err);

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        msg: "Invalid token structure",
        code: "INVALID_TOKEN_STRUCTURE"
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        msg: "Token has expired",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(401).json({
      msg: "Token validation failed",
      code: "TOKEN_VALIDATION_FAILED"
    });
  }
};