const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

/**
 * @file cleanupDuplicates.js
 * @description Administrative script to purge the database of legacy test data 
 * that features duplicate image assets. This ensures that the demo environment 
 * is clean and only shows unique, newly-added assets.
 */

async function cleanup() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('[CLEANUP] Connected to database.');

        // Find all events with an imageName
        const allEvents = await Event.find({ imageName: { $exists: true, $ne: null } });
        
        const seenImages = new Set();
        const toDelete = [];

        for (const event of allEvents) {
            if (seenImages.has(event.imageName)) {
                // We've seen this exact image ID before, mark for deletion
                toDelete.push(event._id);
            } else {
                seenImages.add(event.imageName);
            }
        }

        if (toDelete.length > 0) {
            console.log(`[CLEANUP] Found ${toDelete.length} events with duplicate image references.`);
            const result = await Event.deleteMany({ _id: { $in: toDelete } });
            console.log(`[CLEANUP] SUCCESS: Deleted ${result.deletedCount} items.`);
        } else {
            console.log('[CLEANUP] No duplicate image references found. Database is healthy.');
        }

        // Also delete events with the old "uploads/" path string
        const oldPathResult = await Event.deleteMany({ imageUrl: /uploads\// });
        if (oldPathResult.deletedCount > 0) {
            console.log(`[CLEANUP] Purged ${oldPathResult.deletedCount} legacy "uploads/" path events.`);
        }

        process.exit(0);
    } catch (err) {
        console.error('[CLEANUP] Error:', err.message);
        process.exit(1);
    }
}

cleanup();
