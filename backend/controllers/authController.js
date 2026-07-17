const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

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
  } catch (error) {
    console.error('AUTH ERROR (register):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('AUTH ERROR (login):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};