const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

const resetDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        require('../config/db');
        await mongoose.connection.asPromise();
        console.log('[RESET] Connected to MongoDB cluster...');

                const deleteCount = await Event.deleteMany({});
        console.log(`[WIPE] Successfully deleted ${deleteCount.deletedCount} existing events.`);

                const categories = ['Hackathon', 'News & Alerts', 'Cultural Events', 'Meetup', 'Workshop'];
        const subTitles = ['Championship', 'Gathering', 'Global Summit', 'Regional Hub', 'Live Pulse', 'Network', 'Connect', 'Innovation', 'Future Sync'];
        
        const eventsToInsert = [];

                for(let i = 0; i < 10; i++) {
            const { latOffset, lngOffset } = getRandomCoordinateOffset(1, 5);
            eventsToInsert.push({
                title: `${categories[i % categories.length]} Local: ${subTitles[i % subTitles.length]} @ Bangalore`,
                description: `A hyper-local ${categories[i % categories.length]} event happening right in your neighborhood. Optimized for local community growth.`,
                category: categories[i % categories.length],
                organizerName: 'GeoVibe Local Network',
                isVerified: true,
                source: 'System',
                location: { type: 'Point', coordinates: [CENTER_COORDS.lng + lngOffset, CENTER_COORDS.lat + latOffset] },
                teamSizeMin: 1, teamSizeMax: 4
            });
        }

                for(let i = 0; i < 10; i++) {
            const { latOffset, lngOffset } = getRandomCoordinateOffset(15, 50);
            eventsToInsert.push({
                title: `${categories[i % categories.length]} Regional: ${subTitles[i % subTitles.length]} Hub`,
                description: `Connecting the wider metropolitan area. Join commuters and regional techies for this ${categories[i % categories.length]}.`,
                category: categories[i % categories.length],
                organizerName: 'Metro Regional Authority',
                isVerified: true,
                source: 'System',
                location: { type: 'Point', coordinates: [CENTER_COORDS.lng + lngOffset, CENTER_COORDS.lat + latOffset] },
                teamSizeMin: 1, teamSizeMax: 5
            });
        }

                for(let i = 0; i < 30; i++) {
            const { latOffset, lngOffset } = getRandomCoordinateOffset(100, 200);
            eventsToInsert.push({
                title: `${categories[i % categories.length]} GLOBAL: ${subTitles[i % subTitles.length]} Worldwide`,
                description: `A state-wide prestige event for top-tier participation. Join the ${categories[i % categories.length]} community globally.`,
                category: categories[i % categories.length],
                organizerName: 'Apex Global Sync',
                isVerified: true,
                source: 'System',
                location: { type: 'Point', coordinates: [CENTER_COORDS.lng + lngOffset, CENTER_COORDS.lat + latOffset] },
                teamSizeMin: 1, teamSizeMax: 10
            });
        }

                await Event.insertMany(eventsToInsert);
        console.log(`[SUCCESS] Re-seeded database with 50 premium diverse events across a 200km radius!`);

        await mongoose.disconnect();
        console.log('[DB] Disconnected.');
    } catch (error) {
        console.error('[CRITICAL RESET ERROR]', error);
        process.exit(1);
    }
};

resetDB();
