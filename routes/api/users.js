// routes/api/users.js

const express = require('express');
const router = express.Router();
const User = require('../../models/user'); // your User model

// ------------------------------------
// GET all users (admin only)
// ------------------------------------
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// GET single user by ID (admin only)
// ------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password'); // exclude password
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// DELETE user by ID (admin only)
// ------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// UPDATE user by ID (admin only)
// Optional: update name/email
// ------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body, // { name: 'new name', email: 'new email' }
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
