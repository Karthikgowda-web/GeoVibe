const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');


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


exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }
  res.json({ status: 'success', data: user });
});


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


exports.uploadPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/profiles/${req.file.filename}`;
  res.json({ status: 'success', url: fileUrl });
};
