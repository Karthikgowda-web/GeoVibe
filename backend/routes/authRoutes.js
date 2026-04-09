const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');

const { profileStorage } = require('../config/cloudinary');
const upload = multer({ storage: profileStorage });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.patch('/profile', auth, authController.updateProfile);
router.post('/upload', auth, upload.single('profilePicture'), authController.uploadPhoto);

module.exports = router;
