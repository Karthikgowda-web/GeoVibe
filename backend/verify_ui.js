const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function createTodayEvent() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const todayAtNoon = new Date();
        todayAtNoon.setHours(12, 0, 0, 0);

        const todayEvent = new Event({
            title: 'VERIFICATION: Ends Today',
            description: 'This event should show the Completed badge.',
            deadline: todayAtNoon,
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            category: 'Hackathon',
            organizerName: 'Verification Team',
            isVerified: true,
            source: 'User'
        });

        await todayEvent.save();
        console.log('Created today event for UI verification');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createTodayEvent();
