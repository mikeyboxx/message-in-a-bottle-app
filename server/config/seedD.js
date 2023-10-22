const db = require('./connection');
const seedDaemon = require('../utils/seedDaemon');

db.once('open', async () => {
  seedDaemon({
    distanceInMeters: 546,
    userTargetArr: [
      { // h
        lat: 40.573546,
        lng: -74.005546
      },
      { // oceana
        lat: 40.576804,
        lng: -73.956923
      },
      { // holywood, fl
        lat: 26.018120,
        lng: -80.186987
      },
    ], 
    timeIntervalMilliSecs: 10000,  
    timeIntervalMilliSecsLimit: 600000
  });
});