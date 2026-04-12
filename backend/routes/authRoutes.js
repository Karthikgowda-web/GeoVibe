const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const upload = require('../config/gridfs');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.patch('/profile', auth, authController.updateProfile);
router.post('/upload', auth, upload.single('profilePicture'), authController.uploadPhoto);

module.exports = router;
