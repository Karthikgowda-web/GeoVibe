const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  profilePicture: {
    type: String,
    default: ''
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  defaultDiscoveryRadius: {
    type: Number,
    default: 25
  },
  email: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('User', UserSchema);
