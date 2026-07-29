const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Server-side validation — never trust the frontend alone
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are all required' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();

  // Send welcome email (does not block registration if it fails)
  sendEmail(
    email,
    'Welcome to NightShift',
    `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color: #0a0e1a;">Welcome to NightShift, ${name}! 🎉</h2>
        <p style="color: #333; font-size: 15px; line-height: 1.6;">
          Your account has been created successfully. You can now log in and start managing your team's tasks and bugs.
        </p>
        <p style="color: #888; font-size: 13px; margin-top: 32px;">
          If you did not create this account, please ignore this email.
        </p>
      </div>
    `
  );

  res.status(201).json({ message: 'User registered successfully' });
});

// Login user
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});