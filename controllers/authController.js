const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs if needed
const User = require("../models/User");
const AuthToken = require("../models/authTokens")

exports.register = async (req, res) => {
  const {email, password, username} = req.body;

  try {
    let user = await User.findbyEmail(email);

    if (user) {
      return res.status(400).json({msg: "User already exists"});
    }

    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    // Respond with success message
    res.status(201).json({msg: "User registered", userId, token});

  } catch (err) {
    res.status(500).json({msg: "Server error", error: err.message});
  }
};



exports.login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findbyEmail(email);

    if (!user) {
      return res.status(400).json({msg: "Invalid credentials"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
      return res.status(400).json({msg: "Invalid credentials"});
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

    await AuthToken.create(user.id, token, new Date(Date.now() + 3600000));  // 1 hr expiration

    res.json({token});
  } catch (err) {
    res.status(500).json({msg: "Server error", error: err.message});
  }
};