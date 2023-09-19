import { useEffect, useCallback, useState } from 'react';

const useGps = () => {
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  
  const getGPSLocation = useCallback(() => {
    navigator.geolocation.watchPosition( 
      newPos => {
        const {coords: { accuracy, heading, latitude, longitude, speed }} = newPos;

        setGpsError(null);

        setPosition({
          coords: {
            accuracy, 
            heading,
            latitude: Math.round(latitude * 100000) / 100000,   // rounds it in order to make GPS less sensitive
            longitude: Math.round(longitude * 100000) / 100000,  
            speed 
          }
        });
      },
      gpsError => {
          console.log(gpsError);
          setGpsError({name: 'getGPSLocation', message: gpsError.message});
      }, {
        enableHighAccuracy: false,
        timeout: 60000,
        maximumAge: Infinity
      }
    );
  },[])
  
  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);

  return { position, gpsError };
}

export default useGps;
