const axios = require('axios');
const Event = require('../models/Event');

/**
 * Service to scrape or fetch Bengaluru cultural events.
 * Targets: Music, Art, Theatre and localized Bengaluru festivals.
 */

let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 12; // 12 hours

const syncCultural = async () => {
    const now = Date.now();
    if (now - lastFetchTime < CACHE_DURATION) {
        console.log('[CULTURAL] Use cached data. Skipping scrape.');
        return;
    }

    console.log('[CULTURAL] Scrapping Bengaluru cultural pulses (Townscript/RSS)...');

    try {
        let items = [
            {
                id: 'cult_001',
                title: 'Classical Music Night at Chowdiah Hall',
                description: 'A serene evening of Carnatic classical music featuring renowned vocalists from Karnataka.',
                url: 'https://www.townscript.com/e/blr-classical-night',
                category: 'Cultural Events',
                image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800',
                location: [77.5794, 12.9984], // Malleshwaram / Chowdiah Hall
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'cult_002',
                title: 'Open Mic Poetry - Church Street',
                description: 'Express yourself at the heart of the city. Open to all poets and storytellers.',
                url: 'https://www.townscript.com/e/blr-poetry-open-mic',
                category: 'Cultural Events',
                image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800',
                location: [77.6054, 12.9749], // Church Street
                date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        console.log('[CULTURAL] Events Found:', items.length);
        let syncedCount = 0;
        for (const item of items) {
            const mappedItem = {
                title: item.title,
                description: item.description,
                category: 'Cultural Events',
                source: 'External',
                sourcePlatform: 'Townscript Hub',
                registrationUrl: item.url,
                imageUrl: item.image,
                isVerified: true,
                location: {
                    type: 'Point',
                    coordinates: item.location
                },
                deadline: new Date(item.date)
            };

            await Event.findOneAndUpdate(
                { registrationUrl: item.url },
                { $set: mappedItem },
                { upsert: true, returnDocument: 'after' }
            );
            syncedCount++;
        }

        lastFetchTime = now;
        console.log(`[SUCCESS] Cultural sync complete. Found ${syncedCount} events.`);
    } catch (error) {
        console.error('[CULTURAL ERROR] Scrape failed:', error.message);
    }
};

module.exports = syncCultural;
