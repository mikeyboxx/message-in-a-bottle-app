import { useEffect, useCallback, useState } from 'react';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_GPS_POSITION } from '../../utils/actions';

const useGps = () => {
  const [, dispatch] = useStateContext();
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  
  const getGPSLocation = useCallback(() => {
    // console.log('getGPSLocation');
    navigator.geolocation.watchPosition( 
      newPos => {
        setGpsError(null);
        setPosition(newPos);
        dispatch({
          type: UPDATE_GPS_POSITION,
          position: newPos
        });
      },
      gpsError => {
          console.log(gpsError);
          setGpsError({name: 'getGPSLocation', message: gpsError.message});
      }, {
        enableHighAccuracy: true,
        timeout: 60000,
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
