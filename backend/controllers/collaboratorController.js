const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Collaborator } = require('../models');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'sandbox.smtp.mailtrap.io',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for AlphaWeb',
    text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// Register collaborator
const registerCollaborator = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Check if collaborator already exists
    const existingCollaborator = await Collaborator.findOne({ where: { email } });
    if (existingCollaborator) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create collaborator
    const collaborator = await Collaborator.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      otp,
      otpExpires,
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: 'Collaborator registered successfully. Please verify your email with the OTP sent.',
      collaboratorId: collaborator.id,
    });
  } catch (error) {
    console.error('Collaborator registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login collaborator
const loginCollaborator = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find collaborator
    const collaborator = await Collaborator.findOne({ where: { email } });
    if (!collaborator) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, collaborator.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!collaborator.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: collaborator.id, email: collaborator.email, type: 'collaborator' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      collaborator: {
        id: collaborator.id,
        fullName: collaborator.fullName,
        email: collaborator.email,
        role: collaborator.role,
      },
    });
  } catch (error) {
    console.error('Collaborator login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Forgot password for collaborator
const collaboratorForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const collaborator = await Collaborator.findOne({ where: { email } });
    if (!collaborator) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update collaborator with OTP
    await collaborator.update({ otp, otpExpires });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Collaborator forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Resend OTP for collaborator
const collaboratorResendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const collaborator = await Collaborator.findOne({ where: { email } });
    if (!collaborator) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update collaborator with new OTP
    await collaborator.update({ otp, otpExpires });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP resent to your email' });
  } catch (error) {
    console.error('Collaborator resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};

// Verify OTP for collaborator
const collaboratorVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const collaborator = await Collaborator.findOne({ where: { email } });
    if (!collaborator) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if OTP is valid and not expired
    if (collaborator.otp !== otp || new Date() > collaborator.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified and clear OTP
    await collaborator.update({
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Collaborator OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// Change password for collaborator
const collaboratorChangePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const collaborator = await Collaborator.findOne({ where: { email } });
    if (!collaborator) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await collaborator.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Collaborator change password error:', error);
    res.status(500).json({ message: 'Password change failed', error: error.message });
  }
};

module.exports = {
  registerCollaborator,
  loginCollaborator,
  collaboratorForgotPassword,
  collaboratorResendOTP,
  collaboratorVerifyOTP,
  collaboratorChangePassword,
};
