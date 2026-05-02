const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clearStatic = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        require('../config/db');
        await mongoose.connection.asPromise();
        console.log('[CLEANUP] Connected to MongoDB cluster...');

                const result = await Event.deleteMany({ source: 'System' });
        
        console.log(`[SUCCESS] Permanently wiped ${result.deletedCount} static/generated events.`);
        
        await mongoose.disconnect();
        console.log('[DB] Disconnected.');
    } catch (error) {
        console.error('[CLEANUP ERROR]', error);
        process.exit(1);
    }
};

clearStatic();
