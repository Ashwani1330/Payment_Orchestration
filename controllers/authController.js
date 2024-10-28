const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs if needed
const moment = require('moment-timezone');
const User = require("../models/User");
const AuthToken = require("../models/authTokens");

exports.register = async (req, res) => {
  const { email, password, username } = req.body;
  console.log(req.body);

  try {
    let user = await User.findbyEmail(email);

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    const payload = {
      user: {
        id: userId,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const tokenExpiration = moment().tz('Asia/Kolkata').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
    console.log(tokenExpiration);

    await AuthToken.create(uuidv4(), userId, token, tokenExpiration);  // 1 hr expiration

    // Respond with success message
    res.status(201).json({
      msg: "User registered",
      userId,
      token,
      expiresAt: tokenExpiration
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      msg: "Server error",
      error: err.message || "Unknown error occurred during registration"
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findbyEmail(email);

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Clean up expired tokens before creating new one
    await AuthToken.removeExpiredTokens(user.id);

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const tokenExpiration = moment().tz('Asia/Kolkata').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
    console.log(tokenExpiration);

    await AuthToken.create(uuidv4(), user.id, token, tokenExpiration);

    res.json({
      token,
      expiresAt: tokenExpiration,
      msg: "Login successful"
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      msg: "Server error",
      error: err.message || "Unknown error occurred during login"
    });
  }
};

// Add logout functionality
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await AuthToken.removeToken(token);
    }

    res.json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      msg: "Error during logout"
    });
  }
};