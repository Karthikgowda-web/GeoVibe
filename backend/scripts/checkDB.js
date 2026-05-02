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

const checkDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        require('../config/db');
        await mongoose.connection.asPromise();
        console.log('[DB] Connected for diagnostics...');

        const systemCount = await Event.countDocuments({ source: 'System' });
        const userCount = await Event.countDocuments({ source: 'User' });
        const externalCount = await Event.countDocuments({ source: 'External' });

        console.log('----------------------------------------');
        console.log(`System-Generated Events: ${systemCount}`);
        console.log(`User-Uploaded Events:   ${userCount}`);
        console.log(`External Scraped Events: ${externalCount}`);
        console.log('----------------------------------------');

                                                                                                                                                                                                                                                                                                                                            console.log('[INFO] Database check complete.');
        
        await mongoose.disconnect();
        console.log('[DB] Disconnected.');
    } catch (error) {
        console.error('[DIAGNOSTIC ERROR]', error);
        process.exit(1);
    }
};

checkDB();
