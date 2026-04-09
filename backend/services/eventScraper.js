const Event = require('../models/Event');

const mockBangaloreData = [
  { externalId: 'ext-google-001', title: 'Tech Startup Mixer Blr', description: 'Networking event for tech enthusiasts and founders in Bangalore.', category: 'Meetup' },
  { externalId: 'ext-eventbrite-102', title: 'Open Source UI Frameworks', description: 'An intensive workshop delving deep into React and Vue paradigms.', category: 'Workshop' },
  { externalId: 'ext-google-093', title: 'Global AI Summit 2026', description: 'Exploring the boundary between general intelligence and narrow tech layers.', category: 'Hackathon' },
  { externalId: 'ext-eventbrite-404', title: 'Classical Dance Symphony', description: 'Experience the tradition and culture in an evening to remember.', category: 'Cultural Events' },
  { externalId: 'ext-system-alert-99', title: 'Weather Imbalance Alert', description: 'Heavy rains forecasted in the eastern metropolitan grid tonight.', category: 'News & Alerts' }
];

const REVA_COORDS = { lat: 13.1147, lng: 77.6382 };

const scrapeMockExternalEvents = () => {
  return mockBangaloreData.map(data => {
            const randomLat = REVA_COORDS.lat + (Math.random() * 0.27 - 0.135);
    const randomLng = REVA_COORDS.lng + (Math.random() * 0.27 - 0.135);
    
    return {
      ...data,
      source: 'External',
      isVerified: false,
      organizerName: 'System Bot Data',
      teamSizeMin: 1,
      teamSizeMax: Math.floor(Math.random() * 5) + 1,
      location: {
        type: 'Point',
        coordinates: [randomLng, randomLat]
      }
    };
  });
};

const runScraperJob = async () => {
  try {
    console.log("[CRON] Initiating automated data ingestion scraper...");
    const scrapedData = scrapeMockExternalEvents();

    let upsertedCount = 0;

        for (const eventBody of scrapedData) {
      const result = await Event.updateOne(
        { externalId: eventBody.externalId },         { $setOnInsert: eventBody },                  { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        upsertedCount++;
      }
    }

    console.log(`[CRON] Scraper successfully finished execution. Upserted ${upsertedCount} new external events into MongoDB cluster.`);
  } catch (error) {
    console.error("[CRON] Failed automated data ingestion flow:", error);
  }
};

module.exports = runScraperJob;
