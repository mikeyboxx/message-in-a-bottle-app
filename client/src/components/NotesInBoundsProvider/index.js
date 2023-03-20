import {useEffect, useCallback} from 'react';
import { useLazyQuery } from '@apollo/client';

import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_ERRORS, UPDATE_NOTES_IN_BOUNDS, UPDATE_TIMER } from '../../utils/actions';

function NotesInBounds() {
  const [{mapBounds, timer}, dispatch] = useStateContext();
  const [getNotesInBounds, {data, error}] = useLazyQuery(QUERY_NOTES_IN_BOUNDS,{fetchPolicy: 'network-only'});
  const getBoundsData = useCallback(() => {
    mapBounds && getNotesInBounds({
        variables: {
          swLat: mapBounds.getSouthWest().lat(), 
          swLng: mapBounds.getSouthWest().lng(), 
          neLat: mapBounds.getNorthEast().lat(), 
          neLng: mapBounds.getNorthEast().lng()
        }
      });
  },[getNotesInBounds, mapBounds]);

  useEffect(() => {
    // console.log('useEffect ')
    let timerId = null; 
    if (!timer) {
      timerId = setInterval(async () => {console.log('tick'); getBoundsData();}, 5000);
      dispatch({
        type: UPDATE_TIMER,
        timer: timerId
      });
    }
    // return () => clearInterval(timerId);
  },[timer, dispatch, getBoundsData]);

  useEffect(() => {
    mapBounds && getBoundsData()
  },[getBoundsData, mapBounds]);

  useEffect(() => {
    data?.notesInBounds && dispatch({
      type: UPDATE_NOTES_IN_BOUNDS,
      notesInBounds: data.notesInBounds,
    });
  },[data, dispatch]);

  useEffect(() => {
    if (error) {
      error && dispatch({
        type: UPDATE_ERRORS,
        error: {name: error.name, message: error.message}
      });
    }
  },[error, dispatch]);
}

export default NotesInBounds;
