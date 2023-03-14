import {useEffect, useCallback} from 'react';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_GPS_POSITION, UPDATE_ERRORS } from '../../utils/actions';

function TrackGps() {
  const [, dispatch] = useStateContext();

  const getGPSLocation = useCallback(() => {
    const navId = navigator.geolocation.watchPosition( 
      newPos => {
        dispatch({
          type: UPDATE_GPS_POSITION,
          position: newPos,
        })
      },
      err => 
        dispatch({
          type: UPDATE_ERRORS,
          error: err,
        }),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );

    return () => navigator.geolocation.clearWatch(navId)
  },[dispatch])

  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);
}

export default TrackGps;
