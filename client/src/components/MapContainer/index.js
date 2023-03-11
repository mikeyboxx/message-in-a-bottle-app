import {useState, useCallback, useEffect} from 'react';
import { useLazyQuery } from '@apollo/client';

import {GoogleMap, Marker} from '@react-google-maps/api';
import {useJsApiLoader} from '@react-google-maps/api';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_USER_ACTION, UPDATE_NOTES_IN_PROXIMITY } from '../../utils/actions';

const googleLibraries = ['geometry'];

// google maps options
const defaultMapOptions = { 
  disableDefaultUI: true,
  mapId: '8dce6158aa71a36a',
};

// Marker object's icon property of the User
const userIcon = { 
  fillColor: '#4285F4',
  fillOpacity: 1,
  scale: 8,
  strokeColor: 'rgb(255,255,255)',
  strokeWeight: 4,
};

// Marker object's icon property of the Note
const noteIcon = { 
  fillColor: "black",
  fillOpacity: .7,
  scale: .025,
  path: "M160.8 96.5c14 17 31 30.9 49.5 42.2c25.9 15.8 53.7 25.9 77.7 31.6V138.8C265.8 108.5 250 71.5 248.6 28c-.4-11.3-7.5-21.5-18.4-24.4c-7.6-2-15.8-.2-21 5.8c-13.3 15.4-32.7 44.6-48.4 87.2zM320 144v30.6l0 0v1.3l0 0 0 32.1c-60.8-5.1-185-43.8-219.3-157.2C97.4 40 87.9 32 76.6 32c-7.9 0-15.3 3.9-18.8 11C46.8 65.9 32 112.1 32 176c0 116.9 80.1 180.5 118.4 202.8L11.8 416.6C6.7 418 2.6 421.8 .9 426.8s-.8 10.6 2.3 14.8C21.7 466.2 77.3 512 160 512c3.6 0 7.2-1.2 10-3.5L245.6 448H320c88.4 0 160-71.6 160-160V128l29.9-44.9c1.3-2 2.1-4.4 2.1-6.8c0-6.8-5.5-12.3-12.3-12.3H400c-44.2 0-80 35.8-80 80zm80 16c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16s-7.2 16-16 16z",
};

// minimum zoom to retrieve data from database
const MIN_ZOOM = 4;
const DEFAULT_ZOOM = 18;
const PROXIMITY_THRESHOLD = 20;

export default function MapContainer() {
  const [{position, userAction, notesInProximity}, dispatch] = useStateContext();
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: googleLibraries
  },[]);
  const [googleMap, setGoogleMap] = useState(null);
  const [notesInBounds, setNotesInBounds] = useState(null);
  const [getNotesInBounds, {data, error}] = useLazyQuery(QUERY_NOTES_IN_BOUNDS,{fetchPolicy: 'network-only'});
  const [timer, setTimer] = useState(null);
  
  // get data from the database if zoom level is acceptable
  const getBoundsData = useCallback(() => {
    if (googleMap?.zoom > MIN_ZOOM) {
      const newBounds = googleMap.getBounds();
      newBounds && getNotesInBounds({
        variables: {
          swLat: newBounds.getSouthWest().lat(), 
          swLng: newBounds.getSouthWest().lng(), 
          neLat: newBounds.getNorthEast().lat(), 
          neLng: newBounds.getNorthEast().lng()
        }
      });
    }
  },[googleMap, getNotesInBounds]);
  
  // initialize google map and save in state var
  const onLoad = useCallback(gMap => {
    gMap.setOptions({
      zoom: DEFAULT_ZOOM,
      heading: position?.coords.heading,
      center: {lat: position?.coords.latitude, lng: position?.coords.longitude}
    });
    
    setGoogleMap(gMap);
  },[position]);

  // track google map events
  const onDragEnd = useCallback(() => {
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: 'dragged',
    });
  }, [dispatch]);

  const onZoomChanged = useCallback(() => {
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: 'zoomed',
    });
  }, [dispatch]);

  const onBoundsChanged = useCallback(() => {
    ['dragged', 'zoomed'].includes(userAction) && getBoundsData(); 
  }, [getBoundsData, userAction]);
  
  // retrieve data from the database every 5 seconds, if zoom level is acceptable
  useEffect(()=>{
    if (googleMap){
      const timer = setInterval(async () => getBoundsData(), 5000);
      setTimer(timer);
      return () => clearInterval(timer);
    }
  },[googleMap, getBoundsData]);


  // pan the map if gps state.position changes
  useEffect(()=>{
    if (position && googleMap && userAction === 'center-map' ){
      googleMap.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
      position.coords.accuracy < 10 && googleMap.setHeading(position.coords.heading);
      googleMap.setZoom(DEFAULT_ZOOM);
    }
  },[position,  googleMap, userAction])


  // each time there is new data from the database or the gps state.position has changed, calculate the distance and whether the note is in proximity of the user, and set notesInBounds state variable, causing a re-render 
  useEffect(() => {
    if (data?.notesInBounds && position && googleMap.zoom > MIN_ZOOM) {
      const arr = data.notesInBounds.map(({note}) => {
        const distance =  window.google.maps.geometry.spherical.computeDistanceBetween(
          {lat: position.coords.latitude, lng: position.coords.longitude},
          {lat: note.lat, lng: note.lng});
        return {
          note,
          distance,
          inProximity: distance < PROXIMITY_THRESHOLD
        }
      });

      dispatch({
        type: UPDATE_NOTES_IN_PROXIMITY,
        notesInProximity: arr.filter(note => note.inProximity),
      });

      setNotesInBounds(arr);
    } else
    setNotesInBounds([]);

  },[position, data, googleMap, dispatch]);

  useEffect(()=>{
    (error || loadError) && clearInterval(timer);
  }, [error, loadError, timer]);

  return (
    <>
      {position && isLoaded && !error && !loadError &&
        <GoogleMap    
          id={'googleMap'}
          mapContainerStyle={{height: 
            // this fixes google chrome mobile issue with page height being > screen height
              `${(/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) 
                  ? window.screen.height >= window.innerHeight 
                    ? window.innerHeight 
                    : window.screen.height - (window.innerHeight - window.screen.height) 
                  : Math.min(window.screen.height, window.innerHeight)) - 56}px`, }}
          options={defaultMapOptions}
          onLoad={onLoad}
          onBoundsChanged={onBoundsChanged}
          onZoomChanged={onZoomChanged}
          onDragEnd={onDragEnd}
        >
          <Marker
            position={{lat: position.coords.latitude, lng: position.coords.longitude}} 
            icon={{...userIcon, path: window.google.maps.SymbolPath.CIRCLE}}
          />
          {notesInBounds?.map(({note: {lat, lng}, inProximity}, idx) => 
            <Marker
              key={idx}
              options={{optimized: true}}
              position={{lat, lng}}
              icon={{...noteIcon, fillColor: inProximity  ? "red" : "black"}}  // temporary - changes color of birdie 
            />
          )}
        </GoogleMap>}

      {error && 
        <Alert variant="filled" severity="error">
          {error.message}
        </Alert>}

      {loadError && 
        <Alert variant="filled" severity="error">
          Error loading Google Maps! <br/>
          {loadError.message}
        </Alert>}

      {(!isLoaded || !position) && 
        <CircularProgress/>}
    </>
  )
}