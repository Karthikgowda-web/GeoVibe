const axios = require('axios');
const Event = require('../models/Event');

const syncExternalEvents = async () => {
    console.log('[FETCHER] Starting real-world event synchronization...');
    const API_KEY = process.env.PREDICTHQ_API_KEY;

    try {
        let events = [];

        if (API_KEY) {
                        const response = await axios.get('https://api.predicthq.com/v1/events/', {
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' },
                params: {
                    'location_around.origin': '13.1147,77.6382',                     'location_around.scale': '50km',
                    'limit': 10
                }
            });
            events = response.data.results;
        } else {
            console.warn('[FETCHER] PREDICTHQ_API_KEY missing. Using high-fidelity mock transition data.');
                        events = [
                {
                    id: 'phq_001',
                    title: 'Bangalore Internatonal Tech Expo',
                    description: 'A major gathering of tech giants and startups at the BIEC. Showcasing the future of AI and Robotics.',
                    category: 'conferences',
                    start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                    location: [77.6382, 13.1147],                     phq_registration_url: 'https://example.com/register/tech-expo'
                },
                {
                    id: 'phq_002',
                    title: 'Electronic City Hackathon 2026',
                    description: 'Join the smartest minds in South Bangalore for a 24-hour coding challenge focused on sustainable city solutions.',
                    category: 'hackathons',
                    start: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
                    location: [77.6650, 12.8450],
                    phq_registration_url: 'https://example.com/register/ec-hack'
                }
            ];
        }

        const stats = { updated: 0, inserted: 0 };

        for (const item of events) {
            const eventData = {
                title: item.title,
                description: item.description || 'No description provided by public source.',
                category: mapCategory(item.category),
                sourcePlatform: 'PredictHQ',
                isVerified: false,
                source: 'External',
                externalId: item.id,
                registrationUrl: item.phq_registration_url || 'https://www.predicthq.com',
                deadline: new Date(item.start),
                location: {
                    type: 'Point',
                    coordinates: item.location                 }
            };

            const result = await Event.updateOne(
                { externalId: item.id },
                { $set: eventData },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                stats.inserted++;
            } else {
                stats.updated++;
            }
        }

        console.log(`[SUCCESS] Fetcher finished. Upserted events: ${stats.inserted} new, ${stats.updated} updated.`);
    } catch (error) {
        console.error('[FETCHER ERROR] Sync failed:', error.message);
    }
};

const mapCategory = (phqCat) => {
    const mapping = {
        'conferences': 'Workshop',
        'hackathons': 'Hackathon',
        'concerts': 'Cultural Events',
        'festivals': 'Cultural Events',
        'community': 'Meetup',
        'academic': 'Workshop'
    };
    return mapping[phqCat] || 'Other';
};

module.exports = syncExternalEvents;
