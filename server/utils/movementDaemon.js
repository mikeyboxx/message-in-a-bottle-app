const db = require('../config/connection');
const { Note } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('./trigonometry');

db.once('open', async () => {
  console.log('movementDaemon started');
  
  const ms = 5000;
  let ctr = 0;

  const timer = setInterval(async () => {
    ctr = ctr + (ms / 1000);
    // console.log('movementDaemon', ctr);

    if (ctr > 86400) {
      console.log('movementDaemon finished');
      clearInterval(timer); 
      return null;
    }

    const notes = await Note.find().lean();

    for (let i = 0; i < notes.length; i++){
      try {
          const {_id, lat, lng, bearing} = notes[i];
          const distance = 10;
          const {x, y} = circleXY(distance, bearing);
          const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
          
          await Note.updateOne(
            {
              _id: _id
            },
            {
              lat: position.lat,
              lng: position.lng,
            });
      } catch (err) {
        clearInterval(timer);    
      }
    }
  },ms);
});




