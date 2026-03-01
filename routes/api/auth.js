// routes/api/auth.js

const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // your User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ------------------------------------
// User Signup
// ------------------------------------
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: { name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// User Login
// ------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, 'YOUR_SECRET_KEY', { expiresIn: '1d' });

    res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
