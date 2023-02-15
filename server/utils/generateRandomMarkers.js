const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  // radius of the earth in meters
  const R=6378137 

  // function to convert degress to radians
  const deg2rad = deg => deg * (Math.PI/180);  
  
  const dLat = deg2rad(lat2-lat1);  
  const dLon = deg2rad(lon2-lon1); 
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  
  return d;
}

const circleXY = (r, angle) => {
  const theta = (angle-90) * Math.PI/180; // Convert angle to radians
  return {x: Math.round(r * Math.cos(theta)),
          y: Math.round(-r * Math.sin(theta))}
}

const getLatLonGivenDistanceAndBearing = (lat, lon, x, y) => {
  //Earth’s radius in meters, sphere
  const R=6378137 

  //Coordinate offsets in radians
  const dLat = y / R;
  const dLon = x / (R * Math.cos(Math.PI * lat / 180));

  //OffsetPosition, decimal degrees
  const latO = lat + dLat * 180 / Math.PI;
  const lonO = lon + dLon * 180 / Math.PI;

  return {
    lat: latO, 
    lng: lonO 
  };
}

function getLatLonBounds(currLat, currLng, distanceInMeters = 100){
 //Earth’s radius in meters, sphere
  const R=6378137 // meters

  const bounds = {
    NE: {
      lat: null,
      lng: null
    },
    SW: {
      lat: null,
      lng: null
    },
  };

  // north
  let {x, y} = circleXY(distanceInMeters, 0);
  let {lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y );
  bounds.NE.lat = lat;

  // east
  ({x, y} = circleXY(distanceInMeters, 90));
  ({lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y ));
  bounds.NE.lng = lng;

  // south
  ({x, y} = circleXY(distanceInMeters, 180));
  ({lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y ));
  bounds.SW.lat = lat;

  // west
  ({x, y} = circleXY(distanceInMeters, 270));
  ({lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y ));
  bounds.SW.lng = lng;

 return bounds;
}

const generateRandomMarkers = (lat, lng, distanceInMeters = 100)=>{
  const randomMarkers = [];
  // generate 360 markers
  for (let theta=0; theta<360; theta += 1) {
    const randomDistance = Math.floor(Math.random() * distanceInMeters) + 10;
    const {x, y} = circleXY(randomDistance, theta);
    const position = getLatLonGivenDistanceAndBearing(lat, lng, x, y );
    const distance = getDistanceFromLatLonInMeters(lat, lng, position.lat, position.lng);
    randomMarkers.push({
      id: theta,
      position,
      distance
    })
  }

  return randomMarkers;
}

const updateMarkerDistance = (lat, lng, markers) => {
  return markers.map(marker => {
    return {
      ...marker, 
      distance: getDistanceFromLatLonInMeters(lat, lng, marker.position.lat, marker.position.lng)
    }
  })
}

module.exports = {
  generateRandomMarkers,
  updateMarkerDistance,
  getLatLonBounds,
  getDistanceFromLatLonInMeters
}
