const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('name email');
  res.status(200).json(users);
});