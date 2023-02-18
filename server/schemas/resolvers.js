const { Note } = require('../models');

const resolvers = {
  Query: {
    notes: async () => Note.find(),

    notesInBounds: async (parent, {swLat, swLng, neLat, neLng}) => {
      // console.log('notesInBounds');
      // console.log(currLat, currLng, swLat, swLng, neLat, neLng);
      return await Note.find(
        {
          $and: [
            {lat: {$gt: swLat }},
            {lng: {$gt: swLng }},
            {lat: {$lt: neLat }},
            {lng: {$lt: neLng }},
          ]
        },
      ).lean();
    },
  },
};

module.exports = resolvers;
