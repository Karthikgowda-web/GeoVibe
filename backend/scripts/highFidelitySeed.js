const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REVA_CENTER = { lat: 13.1147, lng: 77.6382 };

const highFidelityEvents = [
  {
    title: 'Bengaluru AI Summit: Generative Art Workshop',
    description: 'Explore the intersection of AI and creativity. This hands-on workshop will teach you how to build and deploy generative models for digital art.',
    category: 'Workshop',
    organizerName: 'AI Explorers Club',
    registrationUrl: 'https://unstop.com/workshop/bengaluru-ai-summit-generative-art-workshop',
    unsplashUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=800',
    lat: 13.1147,
    lng: 77.6382
  },
  {
    title: 'AWS DevDay: Microservices on EKS',
    description: 'A deep dive into container orchestration with Amazon EKS. Learn best practices for scaling microservices in a production-ready cloud environment.',
    category: 'Workshop',
    organizerName: 'AWS User Group Blr',
    registrationUrl: 'https://unstop.com/conference/aws-devday-microservices-on-eks',
    unsplashUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800',
    lat: 13.1200,
    lng: 77.6400
  },
  {
    title: 'Unstop Hackathon 2026: FINTECH Innovation Challenge',
    description: 'Revamping the future of finance. Build innovative solutions for digital payments, blockchain lending, and personal finance management.',
    category: 'Hackathon',
    organizerName: 'Unstop Official',
    registrationUrl: 'https://unstop.com/hackathons/fintech-innovation-challenge',
    unsplashUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
    lat: 13.1100,
    lng: 77.6350
  },
  {
    title: 'Startup Mixer: Koramangala Founder\'s Circle',
    description: 'Network with the brightest minds in India\'s Silicon Valley. A focused mixer for early-stage founders to share strategies and find collaborators.',
    category: 'Meetup',
    organizerName: 'Koramangala Tech Hub',
    registrationUrl: 'https://unstop.com/p/startup-mixer-koramangala-founders-circle',
    unsplashUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800',
    lat: 12.9352,
    lng: 77.6245
  },
  {
    title: 'GoLang Bengaluru Meetup: Performance Tuning',
    description: 'Optimizing Go services for massive scale. Join senior engineers as they demonstrate profiling techniques and GC tuning for high-throughput apps.',
    category: 'Meetup',
    organizerName: 'Go Bengaluru User Group',
    registrationUrl: 'https://unstop.com/meetup/golang-bengaluru-meetup-performance-tuning',
    unsplashUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&q=80&w=800',
    lat: 12.9716,
    lng: 77.5946
  }
];

async function downloadAndUploadImage(url, bucket) {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    const filename = crypto.randomBytes(16).toString('hex') + '.jpg';
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { mimetype: 'image/jpeg' }
    });

    return new Promise((resolve, reject) => {
      response.data.pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => resolve(filename));
    });
  } catch (error) {
    console.error(`Failed to seed image from ${url}:`, error.message);
    return null;
  }
}

async function runSeeder() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
    require('../config/db');
        await mongoose.connection.asPromise();
    console.log('[SEEDER] Connected to MongoDB.');

    // Clear previous high-fidelity seeds if any (to avoid duplicates during dev)
    const deleted = await Event.deleteMany({ sourcePlatform: 'GeoVibe Official' });
    console.log(`[SEEDER] Purged ${deleted.deletedCount} old official vibe cards.`);

    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'event_images'
    });

    for (const eventData of highFidelityEvents) {
      console.log(`[SEEDER] Processing: ${eventData.title}`);
      
      let imageName = null;
      if (eventData.unsplashUrl) {
        imageName = await downloadAndUploadImage(eventData.unsplashUrl, bucket);
      }

      const event = new Event({
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        organizerName: eventData.organizerName,
        registrationUrl: eventData.registrationUrl,
        imageName: imageName,
        isVerified: true,
        source: 'System',
        sourcePlatform: 'GeoVibe Official',
        location: {
          type: 'Point',
          coordinates: [eventData.lng, eventData.lat]
        },
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });

      await event.save();
      console.log(`[SEEDER] Successfully saved: ${eventData.title}`);
    }

    console.log('[SUCCESS] All high-fidelity events seeded with GridFS images.');
    process.exit(0);
  } catch (error) {
    console.error('[CRITICAL SEED ERROR]', error);
    process.exit(1);
  }
}

runSeeder();
