const db = require('./connection');
const seedDaemon = require('../utils/seedDaemon');

db.once('open', async () => {
  seedDaemon({
    distanceInMeters: 546,
    userTargetArr: [
      {
        lat: 40.5736681,
        lng: -74.0055502
      },
      {
        lat: 40.639240,
        lng: -74.001620
      }
    ], 
    timeIntervalMilliSecs: 10000,  
    timeIntervalMilliSecsLimit: 600000
  });
});