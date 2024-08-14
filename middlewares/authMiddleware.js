const jwt = require('jsonwebtoken');
const AuthToken = require('../models/authTokens');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization']; // Use bracket notation
  const token = authHeader && authHeader.replace('Bearer ', ''); // Ensure Bearer is followed by a space

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    const authToken = await AuthToken.findByToken(token);

    if (!authToken) {
      return res.status(401).json({ msg: "Invalid token, authorization denied" });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};