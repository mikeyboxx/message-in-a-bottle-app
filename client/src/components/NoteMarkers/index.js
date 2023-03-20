import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useStateContext } from '../../utils/GlobalState';
import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';
import { UPDATE_NOTES_IN_BOUNDS } from '../../utils/actions';
import { NoteMarker } from '../../components/NoteMarker';


const MAX_NOTES = 200;

const NoteMarkers = ({mapBounds: {swLat, swLng, neLat, neLng}}) => {
  // console.log('NoteMarkers');
  const [{notesInBounds}, dispatch] = useStateContext();

  const {data, error, loading} = useQuery(
    QUERY_NOTES_IN_BOUNDS, 
    {
      fetchPolicy: 'network-only',
      pollInterval: 5000,
      variables: {swLat, swLng, neLat, neLng}
    }
  );

  useEffect(() => {
    data?.notesInBounds && dispatch({
      type: UPDATE_NOTES_IN_BOUNDS,
      notesInBounds: data.notesInBounds,
    });
  },[data, dispatch]);


  return (
    <>
      {notesInBounds?.length <= MAX_NOTES && 
        notesInBounds?.map((note, idx) => 
          <NoteMarker key={idx} note={note} />)}

      {loading && 
        <CircularProgress/>}

      {notesInBounds.length > MAX_NOTES && 
        <Alert variant="filled" severity="error" sx={{position: 'absolute', top: 0}}>
            There are over 200 notes in map bounds. Please zoom in for better results...
        </Alert>}

      {error && 
        <Alert variant="filled" severity="error" sx={{position: 'absolute', top: 0}}>
            {error.name}: {error.message}
        </Alert>}
    </>
  )
}

export default NoteMarkers;
