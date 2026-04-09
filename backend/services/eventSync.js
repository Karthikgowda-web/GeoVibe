const axios = require('axios');
const Event = require('../models/Event');

const BANGALORE_DEFAULT = [77.5946, 12.9716];

const CITY_COORDS = {
    'bangalore':    [77.5946, 12.9716],
    'bengaluru':    [77.5946, 12.9716],
    'hyderabad':    [78.4867, 17.3850],
    'new delhi':    [77.2090, 28.6139],
    'delhi':        [77.2090, 28.6139],
    'mumbai':       [72.8777, 19.0760],
    'chennai':      [80.2707, 13.0827],
    'pune':         [73.8567, 18.5204],
    'kolkata':      [88.3639, 22.5726]
};


const geocodeLocation = async (locationText) => {
    if (!locationText) return BANGALORE_DEFAULT;
    const lower = locationText.toLowerCase();

    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (lower.includes(city)) return coords;
    }

    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: locationText, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'GeoVibe/1.0' },
            timeout: 5000
        });
        if (response.data && response.data.length > 0) {
            return [parseFloat(response.data[0].lon), parseFloat(response.data[0].lat)];
        }
    } catch (error) {
        console.error(`[GEOCODE ERROR] Nominatim failed for "${locationText}": ${error.message}`);
    }
    return BANGALORE_DEFAULT;
};


const syncLiveEventsFromAPI = async () => {
    console.log('[EVENT-SYNC] Starting real-time sync via SerpApi...');
    const API_KEY = process.env.SERPAPI_KEY;
    
    if (!API_KEY) {
        console.error('[EVENT-SYNC] CRITICAL: SERPAPI_KEY is missing from environment variables.');
        return { success: false, error: 'Missing API Key' };
    }

    const queries = ['Hackathons in Bangalore', 'Unstop Hackathons'];
    let allEvents = [];

    try {
        for (const query of queries) {
            console.log(`[SERPAPI] Fetching results for: "${query}"`);
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_events',
                    q: query,
                    api_key: API_KEY
                },
                timeout: 20000
            });

            if (response.data.events_results) {
                allEvents = allEvents.concat(response.data.events_results);
            }
        }

        console.log(`[EVENT-SYNC] Retrieved ${allEvents.length} raw results. Processing upserts...`);

        const stats = { upserted: 0, errors: 0 };

        for (const item of allEvents) {
            try {
                                const coords = await geocodeLocation(item.location || (item.venue ? item.venue.name : 'Bangalore'));

                const mappedEvent = {
                    title: item.title,
                    description: item.description || `Join this event: ${item.title}. Source: ${item.source || 'Google Events'}`,
                    registrationUrl: item.link,                     imageUrl: item.thumbnail,                       category: 'Hackathon',
                    source: 'External',
                    sourcePlatform: 'Google Events',
                    isVerified: true,
                    venueName: item.location || (item.venue ? item.venue.name : 'Bangalore, India'),
                    location: {
                        type: 'Point',
                        coordinates: coords
                    },
                    createdAt: new Date()
                };

                                await Event.findOneAndUpdate(
                    { registrationUrl: item.link },
                    { $set: mappedEvent },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                stats.upserted++;
            } catch (err) {
                console.error(`[EVENT-SYNC] Failed to process event "${item.title}":`, err.message);
                stats.errors++;
            }
        }

        console.log(`[SUCCESS] Event Sync complete. Upserted: ${stats.upserted}, Errors: ${stats.errors}`);
        return { success: true, ...stats };

    } catch (error) {
        console.error('[EVENT-SYNC] CRITICAL FAILURE:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = syncLiveEventsFromAPI;
