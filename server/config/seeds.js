const db = require('./connection');
const { Note, User } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('../utils/generateRandomMarkers');

db.once('open', async () => {
  const distanceInMeters = 8046; // 5 miles
  let lat = 40.5736681;
  let lng = -74.0055502;

  await Note.deleteMany();

  for (let theta=0; theta<360; theta += .1) {
    const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
    const {x, y} = circleXY(randomDistance, theta);
    const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
    const note = await Note.create({
      noteText: `This is Note #: ${(theta + 1).toFixed(1)}`,
      lat: position.lat,
      lng: position.lng,
    });
  }

  lat = 34.1430296530324;
  lng = -118.09969814240472;
  for (let theta=0; theta<360; theta += .1) {
    const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
    const {x, y} = circleXY(randomDistance, theta);
    const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
    const note = await Note.create({
      noteText: `This is Note #: ${(theta + 1).toFixed(1)}`,
      lat: position.lat,
      lng: position.lng,
    });
  }
  lat = 33.616935;
  lng = -78.999047;
  for (let theta=0; theta<360; theta += .1) {
    const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
    const {x, y} = circleXY(randomDistance, theta);
    const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
    const note = await Note.create({
      noteText: `This is Note #: ${(theta + 1).toFixed(1)}`,
      lat: position.lat,
      lng: position.lng,
    });
  }
  
  console.log('notes seeded');
  
  await User.deleteMany();
  
  await User.create({
    firstName: 'Pamela',
    lastName: 'Washington',
    email: 'pamela@testmail.com',
    userName: 'pamWash',
    password: 'password12345'
  });

  await User.create({
    firstName: 'Elijah',
    lastName: 'Holt',
    email: 'eholt@testmail.com',
    userName: 'eliHolt',
    password: 'password12345'
  });

  await User.create({
    firstName: 'System',
    lastName: 'Generated',
    email: 'autoGen@autoGen.com',
    userName: 'autoGen',
    password: 'password12345'
    // orders: [
    //   {
    //     products: [products[0]._id, products[0]._id, products[1]._id]
    //   }
    // ]
  });

  console.log('users seeded');

  process.exit();
});
