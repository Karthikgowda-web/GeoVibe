const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const eventScraperJob = require('../services/eventScraper');
const syncLiveEventsFromAPI = require('../services/eventSync');
const syncSerpApiEvents = require('../services/liveFetcher');
const syncEventAggregator = require('../services/eventAggregator');


exports.runScraper = catchAsync(async (req, res) => {
  console.log('[ADMIN] Manual scraper trigger hit');
  await eventScraperJob();
  res.json({ status: 'success', message: 'Scraper task executed manually.' });
});


exports.runLiveSync = catchAsync(async (req, res) => {
  console.log('[ADMIN] Manual live sync trigger hit');
  const result = await syncLiveEventsFromAPI();
  if (result.success) {
    res.json({ status: 'success', message: 'Live sync task completed.', stats: result });
  } else {
    res.status(500).json({ status: 'error', message: 'Live sync failed: ' + result.error });
  }
});


exports.runSerpSync = catchAsync(async (req, res) => {
  console.log('[ADMIN] Manual SerpApi sync trigger hit');
  const result = await syncSerpApiEvents();
  if (result.success) {
    res.json({ status: 'success', message: 'SerpApi regional sync completed.', stats: result });
  } else {
    res.status(500).json({ status: 'error', message: 'Sync failed: ' + result.error });
  }
});


exports.runAggregator = catchAsync(async (req, res) => {
  console.log('[ADMIN] Manual Event Aggregator sync trigger hit');
  const result = await syncEventAggregator();
  if (result.success) {
    res.json({ status: 'success', message: 'Aggregator sync completed successfully!', stats: result });
  } else {
    res.status(500).json({ status: 'error', message: 'Aggregator sync failed: ' + result.error });
  }
});


exports.testDb = (req, res) => {
  const status = mongoose.connection.readyState;
  const states = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting"
  };
  
  res.json({
    status: 'success',
    dbStatus: states[status] || "Unknown",
    readyState: status,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host
  });
};
