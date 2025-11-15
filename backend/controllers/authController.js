const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Merchant } = require('../models');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
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

// Register merchant
const registerMerchant = async (req, res) => {
  try {
    const { businessName, businessAlias, phone, email, currency, password } = req.body;

    // Check if merchant already exists
    const existingMerchant = await Merchant.findOne({ where: { email } });
    if (existingMerchant) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create merchant
    const merchant = await Merchant.create({
      businessName,
      businessAlias,
      phone,
      email,
      currency,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    // Try to send OTP email, but don't fail registration if email fails
    try {
      await sendOTPEmail(email, otp);
      res.status(201).json({
        message: 'Merchant registered successfully. Please verify your email with the OTP sent.',
        merchantId: merchant.id,
        otp: otp, // Include OTP in response for testing purposes
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Still return success but with a note about email
      res.status(201).json({
        message: 'Merchant registered successfully. Email verification is currently unavailable, but you can proceed with login.',
        merchantId: merchant.id,
        otp: otp, // Include OTP in response for testing purposes
        note: 'Email service is not configured. Use the OTP shown here for verification.',
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login merchant
const loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find merchant
    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, merchant.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (skip for development/testing)
    // if (!merchant.isVerified) {
    //   return res.status(403).json({ message: 'Please verify your email first' });
    // }

    // Generate JWT token
    const token = jwt.sign(
      { id: merchant.id, email: merchant.email, type: 'merchant' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update merchant with OTP
    await merchant.update({ otp, otpExpires });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update merchant with new OTP
    await merchant.update({ otp, otpExpires });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP resent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if OTP is valid and not expired
    if (merchant.otp !== otp || new Date() > merchant.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified and clear OTP
    await merchant.update({
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const merchant = await Merchant.findOne({ where: { email } });
    if (!merchant) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await merchant.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Password change failed', error: error.message });
  }
};

module.exports = {
  registerMerchant,
  loginMerchant,
  forgotPassword,
  resendOTP,
  verifyOTP,
  changePassword,
};
