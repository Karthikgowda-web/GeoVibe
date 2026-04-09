const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.get('/run-scraper', adminController.runScraper);
router.get('/run-live-sync', adminController.runLiveSync);
router.get('/sync-live', adminController.runSerpSync);
router.get('/run-aggregator', adminController.runAggregator);
router.get('/test-db', adminController.testDb);

module.exports = router;
