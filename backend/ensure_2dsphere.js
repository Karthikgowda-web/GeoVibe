const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const createIndex = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI) {
            console.error('[ERROR] MONGO_URI is missing from .env');
            process.exit(1);
        }

        console.log('[INFO] Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        
        console.log('[INFO] Connected. Building 2dsphere index on the "events" collection...');
        
        // Access the raw collection and create the index
        const collection = mongoose.connection.collection('events');
        await collection.createIndex({ location: '2dsphere' });

        console.log('[SUCCESS] 2dsphere index created successfully on the "location" field!');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('[CRITICAL ERROR] Failed to create index:', err.message);
        process.exit(1);
    }
};

createIndex();
