import {useEffect, useCallback, useRef} from 'react';
import { useStateContext } from '../utils/GlobalState';
import { UPDATE_GPS_POSITION, UPDATE_ERRORS } from '../utils/actions';

function useGPSTracker() {
  console.log('useGPSTracker');
  const [, dispatch] = useStateContext();
  const navId = useRef(null);

  const getGPSLocation = useCallback(() => {
    console.log('getGPSLocation');
    navId.current = navigator.geolocation.watchPosition( 
      newPos => {
        console.log('newPos',newPos);
        dispatch({
          type: UPDATE_GPS_POSITION,
          position: newPos,
          navId: navId.current
        })
      },
      err => 
        dispatch({
          type: UPDATE_ERRORS,
          error: err,
          navId: navId.current
        }),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );

  },[dispatch])
  
  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);

  return () => {console.log('clearWatch'); navigator.geolocation.clearWatch(navId.current);};
}

export default useGPSTracker;
