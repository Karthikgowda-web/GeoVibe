const mongoose = require('mongoose');
const Event = require('./models/Event');
require('dotenv').config();

async function checkEvents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const beginningOfToday = new Date();
        beginningOfToday.setHours(0, 0, 0, 0);

        const allCount = await Event.countDocuments();
        const futureTodayCount = await Event.countDocuments({ deadline: { $gte: beginningOfToday } });
        const expiredCount = await Event.countDocuments({ deadline: { $lt: beginningOfToday } });

        console.log(`Total events: ${allCount}`);
        console.log(`Future/Today events: ${futureTodayCount}`);
        console.log(`Expired events (should be filtered): ${expiredCount}`);

        const sampleExpired = await Event.findOne({ deadline: { $lt: beginningOfToday } });
        if (sampleExpired) {
            console.log('Sample expired event:', {
                title: sampleExpired.title,
                deadline: sampleExpired.deadline
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEvents();
