const mongoose = require('mongoose');

/**
 * @file db.js
 * @description Singleton pattern implementation for MongoDB connection using Mongoose.
 * This ensures that only one database connection pool is managed by the application,
 * optimizing resource usage and preventing "Too many connections" errors in production.
 */

class Database {
  /**
   * @constructor
   * Initializes the Database singleton and sets up event listeners.
   */
  constructor() {
    this.gridfsBucket = null;
    this._connect();
  }

  /**
   * Internal connection logic for MongoDB.
   * Uses environment variables for connection strings.
   * @private
   */
  async _connect() {
    // 1. Singleton Pattern Check: Ensure we only have one active instance
    if (mongoose.connections[0].readyState) {
      console.log('[DB] Singleton: Database connection is already active.');
      return;
    }

    let MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';

    // 2. Retry Logic: Ensure the connection string handles retryWrites=true
    if (!MONGO_URI.includes('retryWrites=')) {
      MONGO_URI += MONGO_URI.includes('?') ? '&retryWrites=true&w=majority' : '?retryWrites=true&w=majority';
    }

    // Mask the URI to safely log what Render is using
    const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ':*****@');
    console.log(`[DB] Attempting connection to: ${maskedUri}`);

    try {
      // 4. Optimize Connection Options for long-term stability on MongoDB Atlas
      await mongoose.connect(MONGO_URI, {
        maxPoolSize: 10,
        socketTimeoutMS: 45000
      });
      console.log('[DB] Singleton: Connection established successfully with Optimized Pooling.');
    } catch (err) {
      console.error('[DB] Singleton: Connection failed to initialize.');
      console.error('[DB] Error Details:', err.message);
      process.exit(1);
    }

    // Initialize GridFSBucket only after the connection is fully open.
    // Using 'once' prevents the ENOENT / "Upload Failed" error caused by
    // accessing the DB before it is ready.
    mongoose.connection.once('open', async () => {
      const db = mongoose.connection.db;
      this.gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'event_images'
      });
      console.log('[DB] GridFS: Bucket "event_images" initialized.');

      // Verify Geospatial Index
      try {
        const collections = await db.listCollections({ name: 'events' }).toArray();
        if (collections.length > 0) {
          const indexes = await db.collection('events').indexInformation();
          if (!indexes['location_2dsphere']) {
            console.warn('[DB WARNING] Missing 2dsphere index on "location" field in "events" collection!');
            console.warn('-> ACTION REQUIRED: Run the index generation script to fix geospatial queries on Vercel.');
          } else {
            console.log('[DB] Verified: Geospatial 2dsphere index exists on "events" collection.');
          }
        } else {
          console.log('[DB] "events" collection does not exist yet. Index will be created upon first insertion.');
        }
      } catch (err) {
        console.warn('[DB WARNING] Could not verify indexes:', err.message);
      }
    });

    // Set up runtime listeners for the connection
    mongoose.connection.on('error', (err) => {
      console.error('[DB] Runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] Lost connection to MongoDB.');
    });
  }

  /**
   * Optional helper to manually close the connection (e.g., during tests).
   * @returns {Promise<void>}
   */
  async disconnect() {
    await mongoose.disconnect();
    console.log('[DB] Singleton: Connection closed.');
  }

  /**
   * Getter for the GridFSBucket instance
   * @returns {mongoose.mongo.GridFSBucket}
   */
  getGridFSBucket() {
    return this.gridfsBucket;
  }
}

// Freeze is removed to allow async initialization of GridFSBucket
const instance = new Database();

module.exports = instance;
