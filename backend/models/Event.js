const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageName: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['Hackathon', 'News & Alerts', 'Cultural Events', 'Meetup', 'Workshop', 'Other'],
    default: 'Other'
  },
  organizerName: {
    type: String
  },
  teamSizeMin: {
    type: Number,
    default: 1
  },
  teamSizeMax: {
    type: Number,
    default: 1
  },
  deadline: {
    type: Date
  },
  registrationUrl: {
    type: String
  },
  source: {
    type: String,
    enum: ['User', 'System', 'External', 'System-Generated'],
    default: 'User'
  },
  externalId: {
    type: String,
    unique: true,
    sparse: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  problemStatement: {
    type: String
  },
  venueName: {
    type: String
  },
  originalLink: {
    type: String,
    unique: true,
    sparse: true
  },
  sourcePlatform: {
    type: String,
    default: 'GeoVibe'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  registrationClicks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

EventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', EventSchema);
