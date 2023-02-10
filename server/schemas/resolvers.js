const { generateRandomMarkers } = require('../utils/generateRandomMarkers');

const randomMarkers = generateRandomMarkers(40.5736681, -74.0055502, 1000);
console.log('resolvers');

const resolvers = {
  Query: {
    notesInBounds: async (parent, {swLat, swLng, neLat, neLng}) => {
      const arr = randomMarkers.filter(marker => 
        marker.position.lat > swLat && 
        marker.position.lng > swLng && 
        marker.position.lat < neLat && 
        marker.position.lng < neLng  
      )
      
      return arr;
    },
  },
};

module.exports = resolvers;
