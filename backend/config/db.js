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
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';

    try {
      await mongoose.connect(MONGO_URI);
      console.log('[DB] Singleton: Connection established successfully.');
    } catch (err) {
      console.error('[DB] Singleton: Handshake failed!');
      console.error('Error:', err.message);
      process.exit(1);
    }

    // Initialize GridFSBucket only after the connection is fully open.
    // Using 'once' prevents the ENOENT / "Upload Failed" error caused by
    // accessing the DB before it is ready.
    mongoose.connection.once('open', () => {
      const db = mongoose.connection.db;
      this.gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'event_images'
      });
      console.log('[DB] GridFS: Bucket "event_images" initialized.');
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
