const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function purgeLegacy() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
    require('../config/db');
        await mongoose.connection.asPromise();
    const res = await Event.deleteMany({ 
      source: 'System', 
      sourcePlatform: { $ne: 'GeoVibe Official' } 
    });
    console.log(`[CLEANUP] Purged ${res.deletedCount} legacy system-generated events.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

purgeLegacy();
