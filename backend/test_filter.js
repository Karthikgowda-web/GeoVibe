const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function testFilter() {
    try {
        require('./config/db');
        await mongoose.connection.asPromise();
        console.log('Connected to MongoDB');

        // Create an expired event (yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(12, 0, 0, 0);

        const expiredEvent = new Event({
            title: 'Test Expired Event',
            description: 'This event should be filtered out',
            deadline: yesterday,
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            category: 'Other'
        });

        await expiredEvent.save();
        console.log('Created expired event');

        // Create a today event
        const todayAtNoon = new Date();
        todayAtNoon.setHours(12, 0, 0, 0);
        const todayEvent = new Event({
            title: 'Test Today Event',
            description: 'This event should show as Completed',
            deadline: todayAtNoon,
            location: { type: 'Point', coordinates: [77.5946, 12.9716] },
            category: 'Other'
        });
        await todayEvent.save();
        console.log('Created today event');

        const beginningOfToday = new Date();
        beginningOfToday.setHours(0, 0, 0, 0);

        const visibleEvents = await Event.find({ deadline: { $gte: beginningOfToday } });
        console.log('Visible events count:', visibleEvents.length);
        
        const isExpiredVisible = visibleEvents.some(e => e.title === 'Test Expired Event');
        const isTodayVisible = visibleEvents.some(e => e.title === 'Test Today Event');

        console.log('Is Expired Visible?', isExpiredVisible);
        console.log('Is Today Visible?', isTodayVisible);

        // Cleanup
        await Event.deleteOne({ title: 'Test Expired Event' });
        await Event.deleteOne({ title: 'Test Today Event' });
        console.log('Cleaned up test events');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testFilter();
