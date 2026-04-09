const axios = require('axios');
const Event = require('../models/Event');

const BANGALORE_DEFAULT = [77.5946, 12.9716];

const CITY_COORDS = {
    'bangalore':    [77.5946, 12.9716],
    'bengaluru':    [77.5946, 12.9716],
    'hyderabad':    [78.4867, 17.3850],
    'new delhi':    [77.2090, 28.6139],
    'delhi':        [77.2090, 28.6139],
    'mumbai':       [72.8777, 19.0760],
    'chennai':      [80.2707, 13.0827],
    'pune':         [73.8567, 18.5204],
    'kolkata':      [88.3639, 22.5726],
    'india':        [77.5946, 12.9716],   };


const geocodeLocation = async (locationText) => {
    if (!locationText) return BANGALORE_DEFAULT;

    const lower = locationText.toLowerCase();

        for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (lower.includes(city)) {
            console.log(`[GEOCODE] Fast-resolved "${locationText}" → ${coords}`);
            return coords;
        }
    }

        try {
        console.log(`[GEOCODE] Resolving via Nominatim: ${locationText}`);
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: locationText, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'GeoVibe/1.0 (contact: support@geovibe.io)' },
            timeout: 5000          });

        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return [parseFloat(lon), parseFloat(lat)];
        }
    } catch (error) {
        console.error(`[GEOCODE ERROR] Nominatim failed for "${locationText}": ${error.message}`);
    }

    console.warn(`[GEOCODE] Could not resolve "${locationText}". Using Bangalore default.`);
    return BANGALORE_DEFAULT;
};


const syncEvents = async () => {
    console.log('[AGGREGATOR] Initiating comprehensive sync cycle...');
    const API_KEY = process.env.SERPAPI_KEY;

    try {
                const cleanupResult = await Event.deleteMany({ source: 'System' });
        if (cleanupResult.deletedCount > 0) {
            console.log(`[CLEANUP] Purged ${cleanupResult.deletedCount} legacy System cards.`);
        }

        let rawEvents = [];

        if (API_KEY && API_KEY !== 'your_key_here') {
            console.log('[AGGREGATOR] Fetching live data from SerpApi...');
            const response = await axios.get('https://serpapi.com/search', {
                params: {
                    engine: 'google_events',
                    q: 'Hackathons in India',
                    api_key: API_KEY
                },
                timeout: 15000
            });
            
            if (response.data.events_results) {
                rawEvents = response.data.events_results.map(item => ({
                    targetTitle: item.title,
                    targetReg: item.link,
                    targetImg: item.thumbnail,
                    targetLoc: item.location || (item.venue ? item.venue.name : 'Bangalore, India'),
                    description: item.description || `Join this hackathon and showcase your skills! Source: ${item.source || 'Google Events'}`
                }));
            }
        } else {
            console.warn('[AGGREGATOR] SerpApi Key missing. Injecting high-fidelity Bangalore-area mock hackathons...');
            rawEvents = [
                {
                    targetTitle: 'Smart India Hackathon 2026 – Bangalore Node',
                    targetReg: 'https://sih.gov.in/registration-2026',
                    targetImg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
                    targetLoc: 'NIMHANS Convention Centre, Bengaluru',
                    description: 'The Bangalore regional node of the nationwide Smart India Hackathon. Build solutions for pressing civic, healthcare, and infrastructure challenges.'
                },
                {
                    targetTitle: 'Google Girl Hackathon India – Bangalore',
                    targetReg: 'https://buildyourfuture.withgoogle.com/events/girl-hackathon',
                    targetImg: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
                    targetLoc: 'Google Signature Building, Bangalore',
                    description: 'A program for women students in computer science across India. Bangalore edition hosted at Google Signature, Whitefield.'
                },
                {
                    targetTitle: 'Microsoft Build: India Developer Hackathon',
                    targetReg: 'https://www.microsoft.com/apac/codewithoutbarriers',
                    targetImg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
                    targetLoc: 'Microsoft IDC, Bengaluru',
                    description: 'Empowering software developers and data scientists at Microsoft IDC Bangalore to build next-gen solutions using Azure and GitHub Copilot.'
                },
                {
                    targetTitle: 'GenAI Hackathon – Bangalore Edition',
                    targetReg: 'https://unstop.com/hackathons/genai-bangalore-2026',
                    targetImg: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=800',
                    targetLoc: 'IISc Campus, Bangalore',
                    description: 'Build the next generation of AI applications using LLMs, RAG, and multi-modal models. Hosted at the Indian Institute of Science, Bangalore.'
                },
                {
                    targetTitle: 'BangaloreHacks 5.0',
                    targetReg: 'https://bangalorehacks.devfolio.co',
                    targetImg: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800',
                    targetLoc: 'WeWork Galaxy, Residency Road, Bangalore',
                    description: 'A 36-hour city-wide hackathon bringing together 500+ developers, designers, and innovators at WeWork Galaxy Bangalore.'
                }
            ];
        }

        let syncStats = { upserted: 0, errors: 0 };

        for (const item of rawEvents) {
            try {
                                const coords = await geocodeLocation(item.targetLoc);

                const mappedEvent = {
                    title: item.targetTitle,
                    registrationUrl: item.targetReg,
                    imageUrl: item.targetImg,
                    description: item.description,
                    category: 'Hackathon',
                    source: 'External',
                    sourcePlatform: 'Google Events',
                    venueName: item.targetLoc,
                    location: {
                        type: 'Point',
                        coordinates: coords
                    },
                    createdAt: new Date()
                };

                                await Event.findOneAndUpdate(
                    { registrationUrl: item.targetReg },
                    { $set: mappedEvent },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                syncStats.upserted++;
            } catch (err) {
                console.error(`[AGGREGATOR] Failed to process event ${item.targetTitle}:`, err.message);
                syncStats.errors++;
            }
        }

        console.log(`[SUCCESS] Aggregator Sync complete. Upserted: ${syncStats.upserted}, Errors: ${syncStats.errors}`);
        return { success: true, ...syncStats };
    } catch (error) {
        console.error('[CRITICAL] Aggregator service failure:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = syncEvents;
