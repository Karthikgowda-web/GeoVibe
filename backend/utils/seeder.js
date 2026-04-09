const Event = require('../models/Event');

const mockTitles = [
  "Unidentified Geo-thermal Spike",
  "Rogue Signals Detected",
  "Auroral Anomaly Captured",
  "Seismic Activity - Minor",
  "Unknown Drone Swarm"
];

const mockDescriptions = [
  "Sensors have tripped indicating a sudden thermal rise in this sector. Requires immediate scouting.",
  "Encrypted frequency broadcast originating near this coordinate. Origin unknown.",
  "Atmospheric dispersion leading to strange localized lights.",
  "Micro-tremors consistent with underground tunneling or heavy machinery.",
  "Multiple unidentified low-altitude objects performing complex maneuvers."
];

const fetchExternalEvents = async (lat, lng) => {
  const generatedEvents = [];
  
    for (let i = 0; i < 5; i++) {
            const randomLat = parseFloat(lat) + (Math.random() * 0.1 - 0.05);
    const randomLng = parseFloat(lng) + (Math.random() * 0.1 - 0.05);

    const title = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const description = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
    const imageUrl = `https:
    generatedEvents.push({
      title,
      description,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [randomLng, randomLat]
      }
          });
  }

    const saved = await Event.insertMany(generatedEvents);
  return saved;
};

module.exports = { fetchExternalEvents };
