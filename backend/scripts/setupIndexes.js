const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

/**
 * @file setupIndexes.js
 * @description Administrative script to ensure high-performance geospatial indexing 
 * for the GeoVibe production database. This ensures that the `$near` queries used 
 * in the Dashboard are optimized with a 2dsphere index.
 */

async function setupIndexes() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';

    console.log('[INDEXER] Connecting to database...');
    try {
        require('../config/db');
        await mongoose.connection.asPromise();
        console.log('[INDEXER] Connection established.');

        console.log('[INDEXER] Verifying 2dsphere index on Event.location...');
        
        // Define the index explicitly to be certain it exists in the raw collection
        const collection = mongoose.connection.collection('events');
        
        // Drop existing to ensure no conflicts if type changed (optional but safe for setup)
        try {
            await collection.dropIndex('location_2dsphere');
            console.log('[INDEXER] Dropped legacy location index.');
        } catch (e) {
            // Index might not exist, that's fine
        }

        await collection.createIndex({ location: '2dsphere' }, { name: 'location_2dsphere' });
        
        console.log('[INDEXER] SUCCESS: 2dsphere index created on "events.location".');
        
        const indexes = await collection.indexes();
        console.log('[INDEXER] Current Indexes:', JSON.stringify(indexes, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('[INDEXER] CRITICAL ERROR:', err.message);
        process.exit(1);
    }
}

setupIndexes();
