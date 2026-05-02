const mongoose = require('mongoose');
const Event = require('../models/Event');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * Migration Helper: Converts legacy file-system paths to the new GridFS streaming endpoint.
 * Example: "uploads/image.png" -> imageName: "image.png"
 */
const migratePaths = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        require('../config/db');
        await mongoose.connection.asPromise();
        console.log('[MIGRATION] Connected to DB for path migration...');

        // Find events that still have local "uploads/" in their imageUrl
        const legacyEvents = await Event.find({
            $or: [
                { imageUrl: { $regex: 'uploads/' } },
                { imageName: null, imageUrl: { $ne: null } }
            ]
        });

        console.log(`[MIGRATION] Found ${legacyEvents.length} legacy events to process.`);

        let count = 0;
        for (const event of legacyEvents) {
            // Case 1: URL contains "uploads/" strip it and move to imageName
            if (event.imageUrl && event.imageUrl.includes('uploads/')) {
                const parts = event.imageUrl.split('/');
                event.imageName = parts[parts.length - 1];
                event.imageUrl = null;
                await event.save();
                count++;
            }
            // Case 2: No imageName but has a local (short) filename in imageUrl
            else if (!event.imageName && event.imageUrl && !event.imageUrl.startsWith('http')) {
                event.imageName = event.imageUrl;
                event.imageUrl = null;
                await event.save();
                count++;
            }
        }

        console.log(`[SUCCESS] Migration finished. Updated ${count} event paths.`);
        process.exit(0);
    } catch (error) {
        console.error('[MIGRATION ERROR]', error);
        process.exit(1);
    }
};

migratePaths();
