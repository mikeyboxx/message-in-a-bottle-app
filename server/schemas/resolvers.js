const { Note } = require('../models');
const { getDistanceFromLatLonInMeters } = require('../utils/generateRandomMarkers');

const resolvers = {
  Query: {
    notes: async () => Note.find(),

    notesInBounds: async (parent, {currLat, currLng, swLat, swLng, neLat, neLng}) => {
      let notes = await Note.find(
        {
          $and: [
            {lat: {$gt: swLat }},
            {lng: {$gt: swLng }},
            {lat: {$lt: neLat }},
            {lng: {$lt: neLng }},
          ]
        },
      ).lean();

      return notes.map(note =>{
        const distance = getDistanceFromLatLonInMeters(currLat, currLng, note.lat, note.lng);
        return {
          ...note,
          distance,
          inProximity: distance <= 20
        }
      }); 
    },
  },
};

module.exports = resolvers;
