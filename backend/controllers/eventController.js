const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');


exports.getAllEvents = catchAsync(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 }).populate('author', 'username');
  console.log('[API] getAllEvents - Events found in DB:', events.length);
  res.json({ status: 'success', results: events.length, data: events });
});


exports.getVerifiedEvents = catchAsync(async (req, res) => {
  const events = await Event.find({}).sort({ createdAt: -1 }).populate('author', 'username');
  res.json({ status: 'success', results: events.length, data: events });
});


exports.createEvent = catchAsync(async (req, res) => {
  const { title, description, longitude, latitude, category, organizerName, teamSizeMin, teamSizeMax, deadline, registrationUrl } = req.body;
  
  let imageUrl = null;
  if (req.file) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
  }

  const newEvent = new Event({
    title,
    description,
    imageUrl,
    category,
    organizerName,
    teamSizeMin: teamSizeMin ? parseInt(teamSizeMin) : 1,
    teamSizeMax: teamSizeMax ? parseInt(teamSizeMax) : 1,
    deadline: deadline ? new Date(deadline) : null,
    registrationUrl,
    isVerified: false,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)]
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


exports.getMyEvents = catchAsync(async (req, res) => {
  const events = await Event.find({ author: req.user.id }).sort({ createdAt: -1 });
  res.json({ status: 'success', results: events.length, data: events });
});


exports.updateEvent = catchAsync(async (req, res) => {
  let event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });
  
  if (event.author.toString() !== req.user.id) {
    return res.status(401).json({ status: 'fail', message: 'User not authorized to edit this event' });
  }

  const { title, description, longitude, latitude, category, organizerName, teamSizeMin, teamSizeMax, deadline, registrationUrl } = req.body;
  
  let imageUrl = event.imageUrl;
  if (req.file) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
  }

  event.title = title || event.title;
  event.description = description || event.description;
  event.category = category || event.category;
  event.organizerName = organizerName || event.organizerName;
  if (teamSizeMin) event.teamSizeMin = parseInt(teamSizeMin);
  if (teamSizeMax) event.teamSizeMax = parseInt(teamSizeMax);
  if (deadline) event.deadline = new Date(deadline);
  if (registrationUrl) event.registrationUrl = registrationUrl;
  if (imageUrl) event.imageUrl = imageUrl;
  
  if (longitude && latitude) {
     event.location.coordinates = [parseFloat(longitude), parseFloat(latitude)];
  }

  await event.save();
  res.json({ status: 'success', data: event });
});


exports.deleteEvent = catchAsync(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });

  if (event.author.toString() !== req.user.id) {
    return res.status(401).json({ status: 'fail', message: 'User not authorized to delete this event' });
  }

  await event.deleteOne();
  res.json({ status: 'success', message: 'Event removed' });
});


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

  const events = await Event.find(query);
  console.log(`[API] getNearbyEvents - lat:${lat} lng:${lng} radius:${radius}km -> Found: ${events.length} events`);
  res.json({ status: 'success', results: events.length, data: events });
});


exports.trackClick = catchAsync(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id, 
    { $inc: { registrationClicks: 1 } }, 
    { new: true }
  );
  if (!event) return res.status(404).json({ status: 'fail', message: 'Event not found' });
  
  res.json({ status: 'success', clicks: event.registrationClicks });
});
