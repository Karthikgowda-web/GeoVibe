const axios = require('axios');
const Event = require('../models/Event');

const CENTER_COORDS = { lat: 13.1147, lng: 77.6382 };

const getRandomCoordinateOffset = (minKm, maxKm) => {
    const minDeg = minKm / 111;
    const maxDeg = maxKm / 111;
    let latMag = minDeg + Math.random() * (maxDeg - minDeg);
    let lngMag = minDeg + Math.random() * (maxDeg - minDeg);
    const latOffset = Math.random() > 0.5 ? latMag : -latMag;
    const lngOffset = Math.random() > 0.5 ? lngMag : -lngMag;
    return { latOffset, lngOffset };
};

const syncExternalEvents = async () => {
    console.log('[SYNC] Starting external data synchronization...');
    try {
                const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');
        const externalData = response.data;

        if (!externalData || externalData.length === 0) {
            console.warn('[SYNC] No external events found.');
            return;
        }

        const categories = ['Hackathon', 'Meetup', 'Workshop', 'Cultural Events', 'News & Alerts'];

        const mappedEvents = externalData.map((item, index) => {
            const { latOffset, lngOffset } = getRandomCoordinateOffset(5, 50);
            return {
                title: `[EXTERNAL] ${item.title.substring(0, 50)}...`,
                description: item.body,
                category: categories[index % categories.length],
                organizerName: 'External Tech Feed',
                isVerified: false,
                source: 'System',
                location: {
                    type: 'Point',
                    coordinates: [
                        CENTER_COORDS.lng + lngOffset,
                        CENTER_COORDS.lat + latOffset
                    ]
                },
                teamSizeMin: 1,
                teamSizeMax: 4,
                deadline: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))             };
        });

                        await Event.insertMany(mappedEvents);
        console.log(`[SUCCESS] Synced ${mappedEvents.length} new external events into MongoDB.`);
    } catch (error) {
        console.error('[SYNC ERROR] Synchronization failed:', error.message);
    }
};

module.exports = syncExternalEvents;
