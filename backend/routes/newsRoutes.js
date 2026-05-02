const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

/**
 * @route   GET /api/news
 * @desc    Get latest news stories
 */
router.get('/', newsController.getLatestNews);

/**
 * @route   GET /api/news/external
 * @desc    Fetch news directly from NewsAPI
 */
router.get('/external', newsController.fetchExternalNews);

module.exports = router;
