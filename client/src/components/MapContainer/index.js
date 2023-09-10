import { useState, useCallback, useEffect, useMemo } from 'react';
 import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { useStateContext } from '../../utils/GlobalState';
import useGps from '../../hooks/useGps'
import NoteMarkers from '../../components/NoteMarkers'


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

// Error Alert styles
const alertStyle ={
  position: 'absolute', 
  top: 0, 
  width: '100%'
}

const DEFAULT_ZOOM = 18;

export default function MapContainer() {
  const {isLoaded, loadError} = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
  const {position, gpsError} = useGps();
  const [{userAction, prevUserAction, notesInProximity}] = useStateContext();
  const [googleMap, setGoogleMap] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [panMap, setPanMap] = useState(true);
  
  // this fixes google chrome mobile issue with page height being > screen height
  const mapStyle = useMemo(() => ({
    height: 
    `${(/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) 
        ? window.screen.height >= window.innerHeight 
          ? window.innerHeight 
          : window.screen.height - (window.innerHeight - window.screen.height) 
        : Math.min(window.screen.height, window.innerHeight)) - (56 + (notesInProximity.length > 0 ? 58 : 0))}px`
  }), [notesInProximity])

  // set the initial map options after api map object is loaded
  const onLoad = useCallback(gMap => {
    gMap.setOptions({
      keyboardShortcuts: false,
      zoom: DEFAULT_ZOOM,
      heading: position?.coords.heading,
      center: {lat: position?.coords.latitude, lng: position?.coords.longitude}
    });
    
    setGoogleMap(gMap);
  },[position]);

  // do not pan map if map is dragged
  const onDragEnd = useCallback(() => {
    setPanMap(false);
  },[])

  // set the Map Bounds after drag, zoom, or pan as a result of user's positon changing
  const onIdle = useCallback(() => {
    const bounds = googleMap.getBounds();

    setMapBounds({
      swLat: bounds.getSouthWest().lat(), 
      swLng: bounds.getSouthWest().lng(), 
      neLat: bounds.getNorthEast().lat(), 
      neLng: bounds.getNorthEast().lng()
    });

    // do not pan map if map is zoomed
    if (googleMap.getZoom() !== DEFAULT_ZOOM){
      setPanMap(false);
    }
  },[googleMap]);


  useEffect(() => {
    // pan the map if gps position changes and panMap === true
    if (position && googleMap && panMap){
      googleMap.panTo({lat: position.coords.latitude, lng: position.coords.longitude});

      // change heading only if GPS accuracy is more precise
      position.coords.accuracy < 10 && googleMap.setHeading(position.coords.heading);
    }
    
    if (panMap && googleMap && googleMap.getZoom() !== DEFAULT_ZOOM) { 
      googleMap.setZoom(DEFAULT_ZOOM);
    }
  },[position, googleMap, panMap]);


  // pan map only if previous action was not a modal
  useEffect(() => {
    if (userAction === 'location' && 
      !['signIn', 'signUp', 'create'].includes(prevUserAction)) {
      setPanMap(true);
    }
  },[userAction, prevUserAction])  


  return (
    <>
      {position && isLoaded && !loadError && !gpsError &&
        <GoogleMap    
          mapContainerStyle={mapStyle}
          options={defaultMapOptions}
          onLoad={onLoad}
          onIdle={onIdle}
          onDragEnd={onDragEnd}
        >
          <Marker
            position={{lat: position.coords.latitude, lng: position.coords.longitude}} 
            icon={{...userIcon, path: window.google.maps.SymbolPath.CIRCLE}}
          />

          {mapBounds && <NoteMarkers mapBounds={mapBounds}/>}
        </GoogleMap>}

      {(!isLoaded || !position) && 
        <CircularProgress/>}

      {gpsError && 
        <Alert variant="filled" severity="error" sx={alertStyle}>
            {gpsError.name}: {gpsError.message}
        </Alert>} 

      {loadError && 
      <Alert variant="filled" severity="error" sx={alertStyle}>
          useJsApiLoader: {loadError.message}
      </Alert>} 
    </>
  )
}