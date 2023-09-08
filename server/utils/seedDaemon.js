// const db = require('../config/connection');
const { Note, User } = require('../models');
const { circleXY, getLatLonGivenDistanceAndBearing } = require('./trigonometry');
const getRandomQuote = require('./getRandomQuote');

module.exports = async ({distanceInMeters, userTargetArr, timeIntervalMilliSecs, timeIntervalMilliSecsLimit}) => {
  console.log('seedDaemon started on: ', new Date().toLocaleString());

  let ctr = 0;

  const timer = setInterval(async () => {
    ctr = ctr + timeIntervalMilliSecs;

    if (ctr > timeIntervalMilliSecsLimit) {
      console.log('seedDaemon finished on: ', new Date().toLocaleString());
      clearInterval(timer); 
      process.exit(0);
    }

    for (let i = 0; i < userTargetArr.length; i++){
      try {
        const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
        const randomTheta = (Math.floor(Math.random() * 3600)/10).toFixed(1);
        const {x, y} = circleXY(randomDistance, randomTheta);
        
        let {lat, lng} = userTargetArr[i];
        let position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
        let {q, a} = await getRandomQuote();
        
        if (a !== 'zenquotes.io') {
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
          } else console.log(`${userName} already exists`);

          let note = await Note.findOne({ noteText: q });
          
          if (!note) {
            note = await Note.create({
              noteText: q,
              noteAuthor: userName,
              lat: position.lat,
              lng: position.lng,
              bearing: (ctr / timeIntervalMilliSecs) % 2 === 0 ? Math.floor(Math.random() * 360) + 1 : null
            });

            const result = await User.findOneAndUpdate(
              { _id: user._id },
              { $addToSet: { createdNotes: note._id } },
              { new: true }
            );
          } else console.log(`${q} already exists`);
        } else console.log(q);
      } catch (err) {
        clearInterval(timer); 
        console.log(err);
        process.exit(1);
      }
    }
  },timeIntervalMilliSecs);
};




