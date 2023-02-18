const db = require('./connection');
const { Note } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('../utils/generateRandomMarkers');

db.once('open', async () => {
  const distanceInMeters = 4046; // 5 miles
  const lat = 40.5736681;
  const lng = -74.0055502;

  await Note.deleteMany();

  for (let theta=0; theta<360; theta += 1) {
    const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
    const {x, y} = circleXY(randomDistance, theta);
    const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
    const note = await Note.create({
      noteText: `This is Note #: ${theta + 1}`,
      lat: position.lat,
      lng: position.lng,
    });
  }

  console.log('notes seeded');

  process.exit();
});
