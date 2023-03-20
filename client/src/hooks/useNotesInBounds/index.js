import { useEffect, useCallback}  from 'react';
import { useLazyQuery } from '@apollo/client';
import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';

const useNotesInBounds =  ({swLat, swLng, neLat, neLng}) => {
  // const [getData, { loading, error, data }] = useLazyQuery(QUERY_NOTES_IN_BOUNDS,{
    console.log('useNotesInBounds');
  const [getData, {loading, data, error}]  =  useLazyQuery(QUERY_NOTES_IN_BOUNDS,{
    fetchPolicy: 'network-only',
    // pollInterval: 5000,
    // variables: {swLat, swLng, neLat, neLng}
  });

  // const getBoundsData =
  
  
  // useCallback(async () => {
  //   const data = await getData({ variables: {swLat, swLng, neLat, neLng} });
  // },[getData, swLat, swLng, neLat, neLng]);

  // useEffect(()=>{
  //   getBoundsData();
  // },[getBoundsData]);

  const getNotes = useCallback(() => 
    getData({variables: {swLat, swLng, neLat, neLng}}),[getData, swLat, swLng, neLat, neLng]);

  useEffect(() => {
    let timerId = null; 
      timerId = setInterval(async () => {console.log('tick'); getNotes();}, 10000);
      
    return () => clearInterval(timerId);
  },[getNotes]);

  
  return { loading, data, error }
}

export default useNotesInBounds;
