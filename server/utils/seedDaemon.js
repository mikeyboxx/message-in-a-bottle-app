// const db = require('../config/connection');
const { Note, User } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('./trigonometry');
const getRandomQuote = require('./getRandomQuote');

module.exports = async () => {
  console.log('seedDaemon started on: ', new Date.toLocaleString());

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
    // {
    //   lat: 33.616935,
    //   lng: -78.999047
    // },
  ];
  
  const ms = 5000;
  let ctr = 0;

  const timer = setInterval(async () => {
    ctr = ctr + (ms / 1000);
    // console.log('seedDaemon', ctr);

    // if (ctr > 86400) {
    if (ctr > 3600) {
      console.log('seedDaemon finished on: ', new Date.toLocaleString());
      clearInterval(timer); 
      process.exit(0);
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

          const names = a.split(' ');
          const firstName =  names[0];
          const lastName = names.length === 1 ? '' : names.length >= 3 ? names[2] : names[1];
          const userName = firstName + lastName.slice(0,1).toUpperCase() + lastName.slice(1);
          const email = firstName + '.' +  (lastName || '1') + '@' + 'testmail.com';

          let user = await User.findOne({ userName });

          if (!user) {
            user = await User.create({
              firstName,
              lastName,
              email,
              userName,
              password: 'password12345'
            });
            // console.log('created user ', user);
          }

          const note = await Note.create({
            noteText: q,
            noteAuthor: userName,
            lat: position.lat,
            lng: position.lng,
            // bearing: Math.floor(Math.random() * 360) + 1
          });

          // console.log('created note ', note);

          const result = await User.findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { createdNotes: note._id } },
            { new: true }
          );

          // console.log('updated user ', result.id);

      } catch (err) {
        console.log(err);
        process.exit(1);
      }
    }
  },ms);
};




