const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Get all verified users (used for the assignee dropdown)
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isVerified: true }).select('name email');
  res.status(200).json(users);
});

// Get all users still pending approval (admin only)
exports.getPendingUsers = asyncHandler(async (req, res) => {
  const pending = await User.find({ isVerified: false }).select('name email createdAt');
  res.status(200).json(pending);
});

// Approve a pending user (admin only)
exports.verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: 'User verified successfully' });
});

// Reject (delete) a pending user (admin only)
exports.rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ message: 'User rejected and removed' });
});