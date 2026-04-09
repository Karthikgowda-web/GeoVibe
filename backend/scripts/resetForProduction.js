const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resetForProduction = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        console.log('[PRODUCTION-RESET] Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        
        console.log('[PRODUCTION-RESET] WARNING: About to wipe ALL events from the production-ready cluster...');
        
        const countBefore = await Event.countDocuments({});
        
        if (countBefore === 0) {
            console.log('[PRODUCTION-RESET] Database is already empty. No events to delete.');
        } else {
            const result = await Event.deleteMany({});
            console.log(`[SUCCESS] Purged ${result.deletedCount} events. Database is now at CLEAN STATE for production.`);
        }

        await mongoose.disconnect();
        console.log('[DB] Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('[CRITICAL RESET ERROR]', error);
        process.exit(1);
    }
};

resetForProduction();
