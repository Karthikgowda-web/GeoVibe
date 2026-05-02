const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CENTER_COORDS = { lat: 13.1147, lng: 77.6382 }; 
const getRandomCoordinateOffset = (minKm, maxKm) => {
        const minDeg = minKm / 111;
    const maxDeg = maxKm / 111;
    
        let latMag = minDeg + Math.random() * (maxDeg - minDeg);
    let lngMag = minDeg + Math.random() * (maxDeg - minDeg);
    
        const latOffset = Math.random() > 0.5 ? latMag : -latMag;
    const lngOffset = Math.random() > 0.5 ? lngMag : -lngMag;
    
    return { latOffset, lngOffset };
};

const sampleEvents = [
    {
        title: 'Bangalore Gen-AI Sprint',
        description: 'Join the premier Gen-AI hacking sprint in the sector. Compete for cash prizes and bragging rights in this fast-paced 48 hour marathon.',
        category: 'Hackathon',
        organizerName: 'AI Club Blr',
        teamSizeMin: 2,
        teamSizeMax: 4
    },
    {
        title: 'Electronic City Tech Meetup',
        description: 'A focused discussion round table for aspiring founders and senior tech leads to talk about scaling product ecosystems reliably.',
        category: 'Meetup',
        organizerName: 'Founders Hub India',
        teamSizeMin: 1,
        teamSizeMax: 1
    },
    {
        title: 'Frontend Architecture Summit',
        description: 'An advanced technical deep-dive into micro-frontends and high performance state tracking mechanisms. Sponsored by main tech firms.',
        category: 'Workshop',
        organizerName: 'DevRel Community',
        teamSizeMin: 1,
        teamSizeMax: 1
    },
    {
        title: 'Cloud Infrastructure Hackathon',
        description: 'Deploy optimal cloud architectures from scratch in record time. Open to engineering students and senior professionals alike.',
        category: 'Hackathon',
        organizerName: 'CloudOps Matrix',
        teamSizeMin: 1,
        teamSizeMax: 5
    },
    {
        title: 'Civic Alert: Highway Traffic Diversions',
        description: 'Expect significant delays across major corridors nearby today due to high VIP movement and infrastructure flyover rollouts. Drive safely.',
        category: 'News & Alerts',
        organizerName: 'City Traffic Auth',
        teamSizeMin: 1,
        teamSizeMax: 1
    }
];

const seedData = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/geovibe';
        require('../config/db');
        await mongoose.connection.asPromise();
        console.log('Connected to MongoDB cluster for targeted seeding...');

        const generatedEvents = sampleEvents.map(event => {
                        const { latOffset, lngOffset } = getRandomCoordinateOffset(2, 10);
            
            return {
                ...event,
                isVerified: true,
                source: 'External',
                location: {
                    type: 'Point',
                    coordinates: [
                        CENTER_COORDS.lng + lngOffset,
                        CENTER_COORDS.lat + latOffset
                    ]
                }
            };
        });

        await Event.insertMany(generatedEvents);
        console.log('[SUCCESS] Successfully pushed 5 premium Unstop-style events precisely mapped within a 2km-10km ring around coordinates (13.1147, 77.6382)!');
        
        mongoose.disconnect();
    } catch (error) {
        console.error('[CRITICAL SEED ERROR]', error);
        process.exit(1);
    }
};

seedData();
