const User = require('../models/User');

// Get all users (for assignee dropdown)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};