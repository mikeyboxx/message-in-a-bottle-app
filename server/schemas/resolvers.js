const { generateRandomMarkers, updateMarkerDistance } = require('../utils/generateRandomMarkers');

const randomMarkers = generateRandomMarkers(40.5736681, -74.0055502, 1000);
console.log('resolvers');

const resolvers = {
  Query: {
    notesInBounds: async (parent, {currLat, currLng, swLat, swLng, neLat, neLng}) => {
      const arr = updateMarkerDistance(currLat, currLng, randomMarkers.filter(marker => 
        marker.position.lat > swLat && 
        marker.position.lng > swLng && 
        marker.position.lat < neLat && 
        marker.position.lng < neLng  
      )).map(el => {
          return {
            ...el, 
            inProximity: el.distance <= 20
          } 
      });
      
      return arr;
    },
  },
};

module.exports = resolvers;
