const Event = require('../models/Event');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Fetch news from external NewsAPI (or internal DB if cached)
 * @route   GET /api/news
 * @access  Public
 */
exports.getLatestNews = catchAsync(async (req, res) => {
  // We prioritize 'News & Alerts' category which are synced from external APIs
  const news = await Event.find({ category: 'News & Alerts' })
    .sort({ createdAt: -1 })
    .limit(10);

  if (!news || news.length === 0) {
    // If no news in DB, we could trigger a sync or return empty
    return res.status(200).json({
      status: 'success',
      data: [],
      message: 'No news found in database.'
    });
  }

  res.status(200).json({
    status: 'success',
    results: news.length,
    data: news
  });
});

/**
 * @desc    Fetch news directly from NewsAPI (Proxy)
 * @route   GET /api/news/external
 */
exports.fetchExternalNews = catchAsync(async (req, res) => {
  const API_KEY = process.env.NEWS_API_KEY;
  if (!API_KEY) {
    return res.status(401).json({ status: 'fail', message: 'NewsAPI key missing' });
  }

  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: '(Bangalore OR Bengaluru) AND (tech OR startup OR AI)',
      sortBy: 'publishedAt',
      language: 'en',
      pageSize: 10,
      apiKey: API_KEY
    }
  });

  res.status(200).json({
    status: 'success',
    data: response.data.articles
  });
});
