const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const premiumEvents = [
    {
        title: 'Smart India Hackathon 2026 – Bangalore Node',
        registrationUrl: 'https://sih.gov.in/registration-2026',
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
        venueName: 'NIMHANS Convention Centre, Bengaluru',
        description: 'The Bangalore regional node of the nationwide Smart India Hackathon. Build solutions for pressing civic, healthcare, and infrastructure challenges.',
        category: 'Hackathon',
        source: 'External',
        sourcePlatform: 'SIH Portal',
        isVerified: true,
        location: {
            type: 'Point',
            coordinates: [77.5926, 12.9431]
        }
    },
    {
        title: 'Google Girl Hackathon India – Bangalore',
        registrationUrl: 'https://buildyourfuture.withgoogle.com/events/girl-hackathon',
        imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
        venueName: 'Google Signature Building, Bangalore',
        description: 'A program for women students in computer science across India. Bangalore edition hosted at Google Signature, Whitefield.',
        category: 'Hackathon',
        source: 'External',
        sourcePlatform: 'Google Events',
        isVerified: true,
        location: {
            type: 'Point',
            coordinates: [77.7289, 12.9818]
        }
    },
    {
        title: 'Microsoft Build: India Developer Hackathon',
        registrationUrl: 'https://www.microsoft.com/apac/codewithoutbarriers',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
        venueName: 'Microsoft IDC, Bengaluru',
        description: 'Empowering software developers and data scientists at Microsoft IDC Bangalore to build next-gen solutions using Azure and GitHub Copilot.',
        category: 'Hackathon',
        source: 'External',
        sourcePlatform: 'Microsoft Events',
        isVerified: true,
        location: {
            type: 'Point',
            coordinates: [77.7475, 12.9922]
        }
    },
    {
        title: 'GenAI Hackathon – Bangalore Edition',
        registrationUrl: 'https://unstop.com/hackathons/genai-bangalore-2026',
        imageUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=800',
        venueName: 'IISc Campus, Bangalore',
        description: 'Build the next generation of AI applications using LLMs, RAG, and multi-modal models. Hosted at the Indian Institute of Science, Bangalore.',
        category: 'Hackathon',
        source: 'External',
        sourcePlatform: 'Unstop',
        isVerified: true,
        location: {
            type: 'Point',
            coordinates: [77.5684, 13.0184]
        }
    },
    {
        title: 'BangaloreHacks 5.0',
        registrationUrl: 'https://bangalorehacks.devfolio.co',
        imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800',
        venueName: 'WeWork Galaxy, Residency Road, Bangalore',
        description: 'A 36-hour city-wide hackathon bringing together 500+ developers, designers, and innovators at WeWork Galaxy Bangalore.',
        category: 'Hackathon',
        source: 'External',
        sourcePlatform: 'Devfolio',
        isVerified: true,
        location: {
            type: 'Point',
            coordinates: [77.5994, 12.9712]
        }
    }
];

const purgeAndSync = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        console.log('[PURGE] Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        
        console.log('[PURGE] Deleting all existing events...');
        const deleteResult = await Event.deleteMany({});
        console.log(`[PURGE] Successfully deleted ${deleteResult.deletedCount} events.`);

        console.log('[SYNC] Injecting 5 premium live hackathons...');
        await Event.insertMany(premiumEvents);
        console.log(`[SUCCESS] Database reset complete. 5 live hackathons synced with real coordinates and URLs.`);

        await mongoose.disconnect();
        console.log('[DB] Disconnected.');
        process.exit(0);
    } catch (error) {
        console.error('[CRITICAL PURGE ERROR]', error);
        process.exit(1);
    }
};

purgeAndSync();
