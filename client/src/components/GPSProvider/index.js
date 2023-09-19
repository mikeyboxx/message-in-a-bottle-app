import { useEffect, useCallback } from 'react';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_GPS_POSITION } from '../../utils/actions';

export default function GPSProvider() {
  const [,dispatch] = useStateContext();
  
  const getGPSLocation = useCallback(() => {
    navigator.geolocation.watchPosition( 
      newPos => {
        const {coords: { accuracy, heading, latitude, longitude, speed }} = newPos;
        const obj = {
          coords: {
            accuracy, 
            heading,
            latitude: Math.round(latitude * 100000) / 100000,   // rounds it in order to make GPS less sensitive
            longitude: Math.round(longitude * 100000) / 100000,  
            speed 
          }
        }

        dispatch({
          type: UPDATE_GPS_POSITION,
          position: obj
        });

      },
      gpsError => console.log(gpsError), 
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: Infinity
      }
    );
  },[dispatch])
  
  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);

  return null;
}

