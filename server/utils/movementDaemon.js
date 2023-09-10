const db = require('../config/connection');
const { Note } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('./trigonometry');

  module.exports = ({timeIntervalMilliSecs, distanceInMeters}) => {
  console.log('movementDaemon started on: ', new Date().toLocaleString());
  
  const timer = setInterval(async () => {
    let notes = null;
    try {
      notes = await Note.find().lean();
    } catch (err) {
      console.log(err);
      console.log('movementDaemon finished on: ', new Date().toLocaleString());
      clearInterval(timer);  
    }

    for (let i = 0; i < notes.length; i++){
      try {
          const {_id, lat, lng, bearing} = notes[i];
          if (bearing) {
            const {x, y} = circleXY(distanceInMeters, bearing);
            const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
            
            await Note.updateOne(
              {
                _id: _id
              },
              {
                lat: position.lat,
                lng: position.lng,
              }
            );
          }
      } catch (err) {
        console.log(err);
        console.log('movementDaemon finished on: ', new Date().toLocaleString());
        return clearInterval(timer); 
      }
    }
  },timeIntervalMilliSecs);
};




