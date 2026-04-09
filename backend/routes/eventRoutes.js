const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const eventController = require('../controllers/eventController');

const { eventStorage } = require('../config/cloudinary');
const upload = multer({ storage: eventStorage });

router.get('/', eventController.getAllEvents);
router.get('/all', eventController.getVerifiedEvents);
router.get('/nearby', eventController.getNearbyEvents);
router.post('/click/:id', eventController.trackClick);

router.get('/manage', auth, eventController.getMyEvents);
router.post('/', [auth, upload.single('image')], eventController.createEvent);
router.put('/manage/:id', [auth, upload.single('image')], eventController.updateEvent);
router.delete('/manage/:id', auth, eventController.deleteEvent);

module.exports = router;
