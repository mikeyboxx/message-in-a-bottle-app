const db = require('./connection');
const seedDaemon = require('../utils/seedDaemon');

console.log(process.argv);

db.once('open', async () => {
  const userTargetArr = [
    { // oceana
      lat: 40.576804,
      lng: -73.956923
    },
    { // holywood, fl
      lat: 26.018120,
      lng: -80.186987
    },
  ];

  if (process.argv.length === 4) 
    userTargetArr.push({
      lat: Number(process.argv[2]) || 40.573546, 
      lng: Number(process.argv[3]) || -74.005546
    });

    console.log(userTargetArr);

  seedDaemon({
    distanceInMeters: 5046,
    userTargetArr,
    timeIntervalMilliSecs: 10000,  
    timeIntervalMilliSecsLimit: 600000
  });
});