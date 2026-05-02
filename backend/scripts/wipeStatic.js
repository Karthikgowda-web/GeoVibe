const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const wipeStatic = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        console.log('[WIPE] Connecting to MongoDB...');
        require('../config/db');
        await mongoose.connection.asPromise();
        
        console.log('[WIPE] Searching for static/example cards (source: "System-Generated")...');
        
                const countBefore = await Event.countDocuments({ source: 'System-Generated' });
        
        if (countBefore === 0) {
            console.log('[WIPE] No cards found with source "System-Generated". DB is already clean.');
        } else {
            const result = await Event.deleteMany({ source: 'System-Generated' });
            console.log(`[SUCCESS] Purged ${result.deletedCount} static example cards from the database.`);
        }

                        const systemCount = await Event.countDocuments({ source: 'System' });
        if (systemCount > 0) {
            console.log(`[NOTE] Found ${systemCount} events with source "System". These were NOT deleted by this script.`);
        }

        await mongoose.disconnect();
        console.log('[DB] Disconnected.');
    } catch (error) {
        console.error('[CRITICAL WIPE ERROR]', error);
        process.exit(1);
    }
};

wipeStatic();
