import { useEffect, useCallback } from 'react';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_GPS_POSITION, UPDATE_ERRORS } from '../../utils/actions';

function TrackGps() {
  console.log('TrackGps')
  const [, dispatch] = useStateContext();

  const getGPSLocation = useCallback(() => {
    console.log('getGPSLocation')
    const id = navigator.geolocation.watchPosition( 
      newPos => {
        dispatch({
          type: UPDATE_GPS_POSITION,
          position: newPos,
          navId: id
        });
      },
      err => {
        navigator.geolocation.clearWatch(id);
        dispatch({
          type: UPDATE_ERRORS,
          error: {name: 'getGPSLocation', message: err.message}
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );

    return () => navigator.geolocation.clearWatch(id)
  },[dispatch])

  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);
}

export default TrackGps;
