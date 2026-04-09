const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/profiles';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.patch('/profile', auth, authController.updateProfile);
router.post('/upload', auth, upload.single('profilePicture'), authController.uploadPhoto);

module.exports = router;
