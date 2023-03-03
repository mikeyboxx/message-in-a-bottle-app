import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';
import { useLazyQuery } from '@apollo/client';
import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';

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
const MIN_ZOOM = 15;
const DEFAULT_ZOOM = 18;

export default function MapContainer({startingPosition, navActionHandler, navAction, notesInProximityHandler}) {
  const [position, setPosition] = useState(null);
  const [notesInBounds, setNotesInBounds] = useState(null);
  const [getNotesInBounds, {data}] = useLazyQuery(QUERY_NOTES_IN_BOUNDS,{fetchPolicy: 'network-only'});
  
  const map = useRef(null);
  const zoomChanged = useRef(false);
  const dragEnd = useRef(false);
  
  // argument passed is a google map bounds object
  const getBoundsData = useCallback(bounds => {
    getNotesInBounds({
      variables: {
        swLat: bounds.getSouthWest().lat(), 
        swLng: bounds.getSouthWest().lng(), 
        neLat: bounds.getNorthEast().lat(), 
        neLng: bounds.getNorthEast().lng()
      }
    })
  },[getNotesInBounds]);

  // initial map options (zoom, heading, center of the map)
  const initialMapOptions = useMemo(() => ({
    zoom: DEFAULT_ZOOM,
    heading: startingPosition.coords.heading,
    center: {lat: startingPosition.coords.latitude, lng: startingPosition.coords.longitude}
  }),[startingPosition]);

  // initialize google map and save in useRef
  const onLoad = useCallback(gMap => {
    gMap.setOptions(initialMapOptions);
    map.current = gMap;
  },[initialMapOptions]);

  // track google map events
  const onDragEnd = useCallback(() => dragEnd.current = true,[]);
  const onZoomChanged = useCallback(() => zoomChanged.current = true,[]);
  
  // check if specific google maps events were fired, in order to refresh data based on the new map bounds
  const onIdle = useCallback(() => {
    if (zoomChanged.current || dragEnd.current){
      if (map.current.zoom > MIN_ZOOM) {
        const newBounds = map.current.getBounds();
        newBounds && getBoundsData(newBounds)
      } 
      else {
        setNotesInBounds([]);
      }

      if (dragEnd.current || (zoomChanged.current && (map.current.zoom !== DEFAULT_ZOOM )))
          navActionHandler(null);

      zoomChanged.current = false;
      dragEnd.current = false;
    } 
  },[navActionHandler, getBoundsData]);
  

  useEffect(()=>{
    if (position && navAction === 'location' && map.current){
      const newBounds = map.current.getBounds();
      newBounds && getBoundsData(newBounds)

      map.current.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
      position.coords.accuracy < 10 && map.current.setHeading(position.coords.heading);
      map.current.setZoom(DEFAULT_ZOOM);
    }
  },[position, navAction, getBoundsData])

  // retrieve data from the database every 60 seconds, if zoom level is acceptable
  // after initial render, start monitoring the user's gps location
  useEffect(()=>{
    // const timer = setInterval(()=>{
    //   if (map.current.zoom > MIN_ZOOM) {
    //     const newBounds = map.current.getBounds();
    //     newBounds && getBoundsData(newBounds);
    //   }
    // },60000);
    
    const navId = navigator.geolocation.watchPosition( 
      newPos => 
        setPosition(oldPos => 
          (oldPos?.coords.latitude !== newPos.coords.latitude || 
           oldPos?.coords.longitude !== newPos.coords.longitude) ? newPos : oldPos),
      err => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );

    return () => {
      navigator.geolocation.clearWatch(navId);
      // clearInterval(timer);
    }
  },[]);


  // each time there is new data from the database or the gps position has changed, calculate the distance and whether the note is in proximity of the user, and set notesInBounds state variable, causing a re-render 
  useEffect(() => {
    if (data?.notesInBounds && position && map.current.zoom > MIN_ZOOM) {
      const arr = data.notesInBounds.map(({note}) => {
        const distance =  window.google.maps.geometry.spherical.computeDistanceBetween(
          {lat: position.coords.latitude, lng: position.coords.longitude},
          {lat: note.lat, lng: note.lng});
        return {
          note,
          distance,
          inProximity: distance < 20
        }
      });

      notesInProximityHandler(arr.filter(({inProximity}) => inProximity === true));
      
      setNotesInBounds(arr);
    }
  },[position, data, notesInProximityHandler]);


  return (
    <div style={{flex: '1 1 '}}>
        {position &&  
          <GoogleMap    
            id={'googleMap'}
            mapContainerStyle={{height: '100%'}}
            options={defaultMapOptions}
            onLoad={onLoad}
            onIdle={onIdle}
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
    </div>
  )
}