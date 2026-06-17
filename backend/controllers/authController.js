const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc   Register user
// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, institution, company, course, graduationYear } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = { name, email, password: hashedPassword, role: role || 'student' };
    if (institution) userData.institution = institution;
    if (company) userData.company = company;
    if (course) userData.course = course;
    if (graduationYear) userData.graduationYear = graduationYear;

    // Alumni starts as pending verification
    if (role === 'alumni') { userData.verificationStatus = 'pending'; }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.twoFactorSecret;

    res.status(201).json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    // 2FA check
    if (user.twoFactorEnabled) {
      return res.status(200).json({ success: true, requires2FA: true, userId: user._id });
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.twoFactorSecret;

    res.json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Verify 2FA OTP
// @route  POST /api/auth/verify-2fa
const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret, encoding: 'base32', token, window: 1
    });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    const jwtToken = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.twoFactorSecret;

    res.json({ success: true, token: jwtToken, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Setup 2FA (generate secret + QR)
// @route  POST /api/auth/setup-2fa
const setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `AlumSphere (${req.user.email})` });
    await User.findByIdAndUpdate(req.user._id, { twoFactorSecret: secret.base32 });
    const qr = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ success: true, qrCode: qr, secret: secret.base32 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Enable 2FA after verifying OTP
// @route  POST /api/auth/enable-2fa
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret, encoding: 'base32', token, window: 1
    });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Disable 2FA
// @route  POST /api/auth/disable-2fa
const disable2FA = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { twoFactorEnabled: false, twoFactorSecret: '' });
    res.json({ success: true, message: '2FA disabled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('connections', 'name avatar role');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, verify2FA, setup2FA, enable2FA, disable2FA, getMe };
