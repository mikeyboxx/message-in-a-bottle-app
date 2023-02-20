const { Note } = require('../models');

const resolvers = {
  Query: {
    notes: async () => Note.find(),

    notesInBounds: async (parent, {swLat, swLng, neLat, neLng, lat, lng}) => {
      // console.log('notesInBounds');
      // console.log(currLat, currLng, swLat, swLng, neLat, neLng);
      const data = await Note.find({
        $and: [
          {lat: {$gt: swLat }},
          {lng: {$gt: swLng }},
          {lat: {$lt: neLat }},
          {lng: {$lt: neLng }},
        ]
      });
      
      const notes = data.map(note=>({
        note,
        distance: (lat && lng) && note.getDistance(lat, lng),
      }));

      return notes;
    },
  },
};

module.exports = resolvers;
