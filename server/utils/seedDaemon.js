// const db = require('../config/connection');
const { Note } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('./trigonometry');
const getRandomQuote = require('./getRandomQuote');

module.exports = async () => {
  console.log('seedDaemon started');

  const distanceInMeters = 8046; // 5 miles

  const userTargetArr = [
    {
      lat: 40.5736681,
      lng: -74.0055502
    },
    {
      lat: 40.639240,
      lng: -74.001620
    },
    // {
    //   lat: 34.1430296,
    //   lng: -118.0996981
    // },
    {
      lat: 33.616935,
      lng: -78.999047
    },
  ];
  
  const ms = 30000;
  let ctr = 0;

  const timer = setInterval(async () => {
    ctr = ctr + (ms / 1000);
    console.log('seedDaemon', ctr);

    if (ctr > 86400) {
      console.log('seedDaemon finished');
      clearInterval(timer); 
      return null;
    }

    for (let i = 0; i < userTargetArr.length; i++){
      try {
          const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
          const randomTheta = (Math.floor(Math.random() * 3600)/10).toFixed(1);
          const {x, y} = circleXY(randomDistance, randomTheta);
          
          let {lat, lng} = userTargetArr[i];
          let position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
          let {q, a} = await getRandomQuote();

          await Note.create({
            noteText: q,
            noteAuthor: a,
            lat: position.lat,
            lng: position.lng,
            bearing: Math.floor(Math.random() * 360) + 1
          });
      } catch (err) {
        return clearInterval(timer);    
      }
    }
  },ms);
};




