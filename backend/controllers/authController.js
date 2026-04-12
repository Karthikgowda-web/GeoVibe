const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Registers a new user and returns a JWT token
 * @route   POST /api/auth/register
 * @access  Public
 * @param   {Object} req - Express request object with username/password
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.register = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  let user = await User.findOne({ username });
  if (user) {
    return res.status(400).json({ status: 'fail', message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user = new User({ username, password: hashedPassword });
  await user.save();

  const payload = { user: { id: user.id } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '100h' }, (err, token) => {
    if (err) throw err;
    res.json({ status: 'success', token });
  });
});

/**
 * @desc    Authenticates user and returns a JWT token
 * @route   POST /api/auth/login
 * @access  Public
 * @param   {Object} req - Express request object with credentials
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  let user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ status: 'fail', message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ status: 'fail', message: 'Invalid credentials' });
  }

  const payload = { user: { id: user.id } };
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '100h' }, (err, token) => {
    if (err) throw err;
    res.json({ status: 'success', token });
  });
});

/**
 * @desc    Get current logged-in user details (excluding password)
 * @route   GET /api/auth/me
 * @access  Private
 * @param   {Object} req - Express request containing decoded user info
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }
  res.json({ status: 'success', data: user });
});

/**
 * @desc    Update specific profile fields (bio, notifications, discovery radius)
 * @route   PATCH /api/auth/profile
 * @access  Private
 * @param   {Object} req - Express request with partial user fields
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const fields = ['name', 'profilePicture', 'emailNotifications', 'defaultDiscoveryRadius', 'email', 'bio'];
  const updateData = {};
  
  fields.forEach(field => {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }
  
  res.json({ status: 'success', data: user });
});

/**
 * @desc    Handles profile photo upload logic
 * @param   {Object} req - Request containing multer file
 * @param   {Object} res - Response with file URL
 * @returns {void}
 */
exports.uploadPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  }
  const fileUrl = req.file.filename;
  res.json({ status: 'success', url: fileUrl });
};
