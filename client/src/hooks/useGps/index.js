import { useEffect, useCallback, useState } from 'react';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_GPS_POSITION } from '../../utils/actions';

const useGps = () => {
  const [, dispatch] = useStateContext();
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  
  const getGPSLocation = useCallback(() => {
    console.log('getGPSLocation');
    const id = navigator.geolocation.watchPosition( 
      newPos => {
        setPosition(newPos);
        dispatch({
          type: UPDATE_GPS_POSITION,
          position: newPos
        });
      },
      gpsError => {
        setGpsError({name: 'getGPSLocation', message: gpsError.message});
        navigator.geolocation.clearWatch(id);
        
      }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );
  },[dispatch])
  
  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);
  
  return {position, gpsError};
}

export default useGps;
