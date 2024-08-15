const jwt = require('jsonwebtoken');
const AuthToken = require('../models/authTokens');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization']; // Use bracket notation
  const token = authHeader && authHeader.replace('Bearer ', ''); // Ensure Bearer is followed by a space

  console.log("Authorization Header:", authHeader); // Log the Authorization header
  console.log("Extracted Token:", token); // Log the extracted token


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

    // If the token is expired, regenerate it
    if (new Date(authToken.expiresAt) < new Date()) {
      // Generate a new token
      const newToken = jwt.sign({ user: req.user }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // Update the token in the database
      await AuthToken.create(authToken.UniqueId, authToken.userId, newToken, new Date(Date.now() + 3600000)); // Token valid for 1 hour
      // Send the new token to the user
      return res.json({ token: newToken });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};