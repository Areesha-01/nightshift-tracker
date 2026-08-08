const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (process.env.NODE_ENV === 'test') {
    return; // Skip actual email sending during automated tests
  }
  try {
    await transporter.sendMail({
      from: `"NightShift" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: 'Welcome to NightShift! Your account has been created successfully. You can now log in and start managing your team\'s tasks and bugs.',
    });
    console.log('Email sent successfully to', to);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = sendEmail;