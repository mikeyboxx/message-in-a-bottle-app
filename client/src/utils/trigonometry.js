export const circleXY = (r, angle) => {
  const theta = (angle-90) * Math.PI/180; // Convert angle to radians
  return {x: Math.round(r * Math.cos(theta)),
          y: Math.round(-r * Math.sin(theta))}
}

export const getLatLonGivenDistanceAndBearing = (lat, lon, x, y) => {
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

export const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
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


export const getLatLonBounds = (currLat, currLng, distanceInMeters = 100) =>{
  const bounds = {};

  // north
  let {x, y} = circleXY(distanceInMeters, 0);
  let {lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y );
  bounds.neLat = lat;

  // east
  ({x, y} = circleXY(distanceInMeters, 90));
  ({lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y ));
  bounds.neLng = lng;

  // south
  ({x, y} = circleXY(distanceInMeters, 180));
  ({lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y ));
  bounds.swLat = lat;

  // west
  ({x, y} = circleXY(distanceInMeters, 270));
  ({lat, lng } = getLatLonGivenDistanceAndBearing(currLat, currLng, x, y ));
  bounds.swLng = lng;

 return bounds;
}