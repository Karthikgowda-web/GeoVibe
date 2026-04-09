const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const eventController = require('../controllers/eventController');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', eventController.getAllEvents);
router.get('/all', eventController.getVerifiedEvents);
router.get('/nearby', eventController.getNearbyEvents);
router.post('/click/:id', eventController.trackClick);

router.get('/manage', auth, eventController.getMyEvents);
router.post('/', [auth, upload.single('image')], eventController.createEvent);
router.put('/manage/:id', [auth, upload.single('image')], eventController.updateEvent);
router.delete('/manage/:id', auth, eventController.deleteEvent);

module.exports = router;
