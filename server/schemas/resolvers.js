const { 
  generateRandomMarkers, 
  updateMarkerDistance, 
  getLatLonBounds,
  getDistanceFromLatLonInMeters } = require('../utils/generateRandomMarkers');

const randomMarkers = generateRandomMarkers(40.5736681, -74.0055502, 1000);
console.log('resolvers');

const resolvers = {
  Query: {
    notesInBounds: async (parent, {currLat, currLng, swLat, swLng, neLat, neLng}) => {
      // console.log('notesInBounds');
      // console.log(currLat, currLng, swLat, swLng, neLat, neLng);
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
    notesInProximity: async (parent, {currLat, currLng, distance}) => {
      // console.log('notesInProximity');
      if (currLat === 0 && currLng === 0){
        return null;
      }

      const bounds = getLatLonBounds(currLat, currLng, distance);

      const arr = randomMarkers.filter(marker => 
        marker.position.lat > bounds.SW.lat && 
        marker.position.lng > bounds.SW.lng && 
        marker.position.lat < bounds.NE.lat && 
        marker.position.lng < bounds.NE.lng  
      ).map(el=>{
        const distance = getDistanceFromLatLonInMeters(currLat, currLng, el.position.lat, el.position.lng);
        return {
          ...el,
          distance,
          inProximity: distance <= 20
        }
      });
      
      return arr;
    },
  },
};

module.exports = resolvers;
