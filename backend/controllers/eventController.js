const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');
const dbInstance = require('../config/db');

/**
 * @desc    Fetch all events from the database
 * @route   GET /api/events
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllEvents = catchAsync(async (req, res) => {
  const beginningOfToday = new Date();
  beginningOfToday.setHours(0, 0, 0, 0);

  const events = await Event.find({ 
    deadline: { $gte: beginningOfToday } 
  }).sort({ createdAt: -1 }).populate('author', 'username');

  console.log('[API] getAllEvents - Future/Today events found:', events.length);
  res.json({ status: 'success', results: events.length, data: events });
});

/**
 * @desc    Fetch only verified events sorted by creation date
 * @route   GET /api/events/all
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getVerifiedEvents = catchAsync(async (req, res) => {
  const beginningOfToday = new Date();
  beginningOfToday.setHours(0, 0, 0, 0);

  const events = await Event.find({
    deadline: { $gte: beginningOfToday }
  }).sort({ createdAt: -1 }).populate('author', 'username');
  
  res.json({ status: 'success', results: events.length, data: events });
});

/**
 * @desc    Initialize a new event with location coordinates and optional image
 * @route   POST /api/events
 * @access  Private (Logged-in Organizers)
 * @param   {Object} req - Express request object containing event body and file
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.createEvent = catchAsync(async (req, res) => {
  const { title, description, longitude, latitude, category, organizerName, teamSizeMin, teamSizeMax, deadline, registrationUrl, registerLink } = req.body;
  
  let imageUrl = null;
  let imageName = null;

  if (req.file) {
    // GridFS storage gives us the generated unique filename in req.file.filename
    imageName = req.file.filename;
  }

  // Robust parsing: prefer registerLink if registrationUrl is missing
  const finalRegistrationUrl = registrationUrl || registerLink;
  
  // Safeguard coordinates to prevent NaN
  const safeLng = parseFloat(longitude);
  const safeLat = parseFloat(latitude);

  if (isNaN(safeLng) || isNaN(safeLat)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid location coordinates provided.' });
  }

  const newEvent = new Event({
    title,
    description,
    imageUrl,
    imageName,
    category,
    organizerName,
    teamSizeMin: teamSizeMin ? parseInt(teamSizeMin) : 1,
    teamSizeMax: teamSizeMax ? parseInt(teamSizeMax) : 1,
    deadline: deadline ? new Date(deadline) : null,
    registrationUrl: finalRegistrationUrl,
    isVerified: false,
    location: {
      type: 'Point',
      coordinates: [safeLng, safeLat]
    },
    author: req.user ? req.user.id : null
  });

  const event = await newEvent.save();
  
  const io = req.app.get('io');
  if (io) {
    io.emit('newEvent', event);
  }

  res.status(201).json({ status: 'success', data: event });
});

/**
 * @desc    Retrieve all events created by the currently authenticated user
 * @route   GET /api/events/manage
 * @access  Private
 * @param   {Object} req - Express request object with user ID
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getMyEvents = catchAsync(async (req, res) => {
  const events = await Event.find({ author: req.user.id }).sort({ createdAt: -1 });
  res.json({ status: 'success', results: events.length, data: events });
});

/**
 * @desc    Update an existing event's details
 * @route   PUT /api/events/manage/:id
 * @access  Private (Owner only)
 * @param   {Object} req - Express request object with update body
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateEvent = catchAsync(async (req, res) => {
  let event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });
  
  if (event.author.toString() !== req.user.id) {
    return res.status(401).json({ status: 'fail', message: 'User not authorized to edit this event' });
  }

  const { title, description, longitude, latitude, category, organizerName, teamSizeMin, teamSizeMax, deadline, registrationUrl, registerLink } = req.body;
  
  let imageUrl = event.imageUrl;
  let imageName = event.imageName;

  if (req.file) {
    imageName = req.file.filename;
    imageUrl = null; // Prioritize local imageName for GridFS
  }

  event.title = title || event.title;
  event.description = description || event.description;
  event.category = category || event.category;
  event.organizerName = organizerName || event.organizerName;
  if (teamSizeMin) event.teamSizeMin = parseInt(teamSizeMin);
  if (teamSizeMax) event.teamSizeMax = parseInt(teamSizeMax);
  if (deadline) event.deadline = new Date(deadline);
  
  const finalRegUrl = registrationUrl || registerLink;
  if (finalRegUrl) event.registrationUrl = finalRegUrl;
  
  if (imageUrl !== undefined) event.imageUrl = imageUrl;
  if (imageName) event.imageName = imageName;
  
  if (longitude && latitude) {
     const safeLng = parseFloat(longitude);
     const safeLat = parseFloat(latitude);
     if (!isNaN(safeLng) && !isNaN(safeLat)) {
        event.location.coordinates = [safeLng, safeLat];
     }
  }

  await event.save();
  res.json({ status: 'success', data: event });
});

/**
 * @desc    Permanently remove an event from the platform
 * @route   DELETE /api/events/manage/:id
 * @access  Private (Owner only)
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteEvent = catchAsync(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

  if (event.author.toString() !== req.user.id) {
    return res.status(401).json({ status: 'fail', message: 'User not authorized to delete this event' });
  }

  await event.deleteOne();
  res.json({ status: 'success', message: 'Event removed' });
});

/**
 * @desc    Perform a geospatial search to find events within a 2D radius
 * @route   GET /api/events/nearby
 * @access  Public
 * @param   {Object} req - Express request object with lat, lng, and radius params
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.getNearbyEvents = catchAsync(async (req, res) => {
  const { lat, lng, radius = 5, category } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ status: 'fail', message: 'Latitude and Longitude are required' });
  }

  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseFloat(radius) * 1000
      }
    }
  };

  if (category) {
    query.category = category;
  }

  const beginningOfToday = new Date();
  beginningOfToday.setHours(0, 0, 0, 0);
  query.deadline = { $gte: beginningOfToday };

  const events = await Event.find(query);
  console.log(`[API] getNearbyEvents - lat:${lat} lng:${lng} radius:${radius}km -> Found: ${events.length} events`);
  res.json({ status: 'success', results: events.length, data: events });
});

/**
 * @desc    Increment the engagement metric (clicks) for a specific event
 * @route   POST /api/events/click/:id
 * @access  Public
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Promise<void>}
 */
exports.trackClick = catchAsync(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id, 
    { $inc: { registrationClicks: 1 } }, 
    { new: true }
  );
  if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });
  
  res.json({ status: 'success', clicks: event.registrationClicks });
});

/**
 * @desc    Stream an event image from MongoDB GridFS
 * @route   GET /api/events/image/:filename
 * @access  Public
 * @param   {Object} req - Request with filename param
 * @param   {Object} res - Response stream
 */
exports.getEventImage = catchAsync(async (req, res) => {
  const db = require('mongoose').connection.db;

  if (!db) {
    return res.status(503).json({ status: 'fail', message: 'Database not ready. Try again shortly.' });
  }

  const bucket = new (require('mongoose').mongo.GridFSBucket)(db, { bucketName: 'event_images' });

  const files = await bucket.find({ filename: req.params.filename }).toArray();

  if (!files || files.length === 0) {
    return res.status(404).json({ status: 'fail', message: 'Image not found' });
  }

  const mimeType = files[0].metadata?.mimetype || 'image/jpeg';
  res.set('Content-Type', mimeType);
  res.set('Cache-Control', 'public, max-age=86400'); // 24h cache

  const readStream = bucket.openDownloadStreamByName(req.params.filename);
  readStream.on('error', () => {
    if (!res.headersSent) {
      res.status(500).json({ status: 'fail', message: 'Error streaming image' });
    }
  });
  readStream.pipe(res);
});
