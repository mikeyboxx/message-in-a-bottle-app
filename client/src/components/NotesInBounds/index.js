import {useEffect, useCallback} from 'react';
import { useLazyQuery } from '@apollo/client';

import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_ERRORS, UPDATE_NOTES_IN_BOUNDS } from '../../utils/actions';

function NotesInBounds() {
  const [{mapBounds}, dispatch] = useStateContext();
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
    const timer = setInterval(async () => {/*console.log('tick');*/ getBoundsData();}, 5000);
    return () => clearInterval(timer);
  },[getBoundsData]);

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
    error && dispatch({
      type: UPDATE_ERRORS,
      error,
    });
  },[error, dispatch]);

}

export default NotesInBounds;
