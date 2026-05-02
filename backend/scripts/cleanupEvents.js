const mongoose = require('mongoose');
const Event = require('../models/Event');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const cleanup = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
    require('../config/db');
        await mongoose.connection.asPromise();
    console.log('Connected to DB for cleanup...');
    
    // Delete legacy User-hosted events that don't have a unique imageName (GridFS)
    // This removes events that were using the hardcoded placeholder logic.
    const result = await Event.deleteMany({ 
      source: 'User', 
      imageName: { $exists: false } 
    });
    
    console.log(`[SUCCESS] Deleted ${result.deletedCount} legacy test events.`);
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
