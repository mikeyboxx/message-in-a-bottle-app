import {useState, useCallback, useEffect, useMemo, useRef, useLayoutEffect} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';
import { useLazyQuery } from '@apollo/client';
import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';


export default function MapContainer({startingPosition}) {
  // console.log('MapContainer');
  const [position, setPosition] = useState(null);
  const [notesInBounds, setNotesInBounds] = useState(null);
  const [getNotesInBounds, {data}] = useLazyQuery(QUERY_NOTES_IN_BOUNDS);
  
  const map = useRef(null);
  const prevPosition = useRef({});
  const zoomChanged = useRef(false);
  const dragEnd = useRef(false);

  // Marker object's icon property of the User
  const userIcon = useMemo(()=>({ 
    fillColor: '#4285F4',
    fillOpacity: 1,
    scale: 8,
    strokeColor: 'rgb(255,255,255)',
    strokeWeight: 4,
  }),[]);

  // Marker object's icon property of the Note
  const noteIcon = useMemo(()=>({ 
    fillColor: "black",
    fillOpacity: .7,
    scale: .03,
    path: "M160.8 96.5c14 17 31 30.9 49.5 42.2c25.9 15.8 53.7 25.9 77.7 31.6V138.8C265.8 108.5 250 71.5 248.6 28c-.4-11.3-7.5-21.5-18.4-24.4c-7.6-2-15.8-.2-21 5.8c-13.3 15.4-32.7 44.6-48.4 87.2zM320 144v30.6l0 0v1.3l0 0 0 32.1c-60.8-5.1-185-43.8-219.3-157.2C97.4 40 87.9 32 76.6 32c-7.9 0-15.3 3.9-18.8 11C46.8 65.9 32 112.1 32 176c0 116.9 80.1 180.5 118.4 202.8L11.8 416.6C6.7 418 2.6 421.8 .9 426.8s-.8 10.6 2.3 14.8C21.7 466.2 77.3 512 160 512c3.6 0 7.2-1.2 10-3.5L245.6 448H320c88.4 0 160-71.6 160-160V128l29.9-44.9c1.3-2 2.1-4.4 2.1-6.8c0-6.8-5.5-12.3-12.3-12.3H400c-44.2 0-80 35.8-80 80zm80 16c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16s-7.2 16-16 16z",
  }),[]);

  // default GoogleMap options
  const defaultMapOptions = useMemo(()=>({ 
    disableDefaultUI: true,
    isFractionalZoomEnabled: false,
    minZoom: 13,
    // maxZoom: 20,
    mapId: '8dce6158aa71a36a',
  }),[]);

  // default GoogleMap styles
  const mapContainerStyle = useMemo(()=>({ 
    height: '100vh', 
    width: '100%', 
    position: 'relative' 
  }),[]);

  const getDistance = useCallback((source, destination) => {
    return window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(source.lat, source.lng),
      new window.google.maps.LatLng(destination.lat, destination.lng)
    );
  },[]);

  const onLoad = useCallback(gMap => {
    // console.log('onLoad');
    gMap.setOptions({
      zoom: 20,
      heading: startingPosition.coords.heading,
      center:  {
        lat: startingPosition.coords.latitude,
        lng: startingPosition.coords.longitude,
      }
    });
    
    map.current = gMap;
  },[startingPosition]);
  
  const onDragEnd = useCallback(() => dragEnd.current = true,[]);

  const onZoomChanged = useCallback(() => zoomChanged.current = true,[]);
  
  const onIdle = useCallback(() => {
    // console.log('onIdle');
    if (map.current && (zoomChanged.current === true || dragEnd.current === true)) {
      const newBounds = map.current.getBounds();
      if (newBounds) {
        // console.log('getNotes in onIdle');
        getNotesInBounds({variables: {
          currLat: position.coords.latitude,
          currLng: position.coords.longitude,
          swLat: newBounds.getSouthWest().lat(), 
          swLng: newBounds.getSouthWest().lng(), 
          neLat: newBounds.getNorthEast().lat(), 
          neLng: newBounds.getNorthEast().lng()
        }});
      }
    }
    zoomChanged.current = false;
    dragEnd.current = false;
  },[getNotesInBounds, position]);


  useEffect(() => {
    if (data?.notesInBounds) {
      const arr = data.notesInBounds.map(note => {
        const distance = getDistance(
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          {
            lat: note.lat,
            lng: note.lng
          }
        );
        
        return {
          ...note,
          distance,
          inProximity: distance < 30
        }
      });
      // console.log(arr);
      setNotesInBounds(arr);
    }
  },[data, getDistance, position]);


  // first time get current gps position
  useEffect(()=>{
    const navId = navigator.geolocation.watchPosition( 
      newPos => {
        
        setPosition(oldPos => {
          let currPos;

          if (oldPos?.coords.latitude !== newPos.coords.latitude || 
            oldPos?.coords.longitude !== newPos.coords.longitude){
            currPos = newPos;
          } else {
            currPos = oldPos;
          };

          if (Object.keys(prevPosition.current).length === 0){
            prevPosition.current.lat = currPos.coords.latitude;
            prevPosition.current.lng = currPos.coords.longitude;
          };
  
          const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(prevPosition.current.lat, prevPosition.current.lng),
            new window.google.maps.LatLng(currPos.coords.latitude, currPos.coords.longitude));
  
          if (dist > 40) {
            prevPosition.current.lat = currPos.coords.latitude;
            prevPosition.current.lng = currPos.coords.longitude;
            const newBounds = map.current.getBounds();
            if (newBounds) {
              console.log('getNotes in setPosition');
              getNotesInBounds({variables: {
                currLat: currPos.coords.latitude,
                currLng: currPos.coords.longitude0,
                swLat: newBounds.getSouthWest().lat(), 
                swLng: newBounds.getSouthWest().lng(), 
                neLat: newBounds.getNorthEast().lat(), 
                neLng: newBounds.getNorthEast().lng()
              }});
            }
          }
          return currPos;
        });
      },
      err => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );
      
    return () => navigator.geolocation.clearWatch(navId);
  },[getNotesInBounds]);


  useEffect(() => {
    if (map.current){
      (position.coords.speed > .02) &&
        map.current.panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      (position.coords.accuracy < 15) && map.current.setHeading(position.coords.heading);
    } 
  },[position]);


  return (
    <>
      {position && 
        <GoogleMap
          options={defaultMapOptions}
          mapContainerStyle={mapContainerStyle}
          onLoad={onLoad}
          onIdle={onIdle}
          onZoomChanged={onZoomChanged}
          onDragEnd={onDragEnd}
        >
          <Marker
            position={{
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }}
            icon={{
              ...userIcon,
              path: window.google.maps.SymbolPath.CIRCLE
            }}
          />
          
          {notesInBounds?.map((note, idx) => 
            <Marker
              key={idx}
              options={{
                optimized: true,
              }}
              position={{
                lat: note.lat,
                lng: note.lng
              }}
              icon={{...noteIcon, fillColor: note.inProximity ? "red" : "black"}}
            />
          )}
        </GoogleMap>}

      {position &&       
        <div 
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: '200px',
            height: '400px',
            backgroundColor: 'black',
            opacity: .2,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '.85em',
            overflow: 'auto'
          }}>
            
          <p>
            Zoom: {map?.current?.zoom} <br/>
            Curr Lat: {position.coords.latitude}<br/>
            Curr Lng: {position.coords.longitude}<br/><br/>
            geolocation Heading: {position.coords.heading} <br/><br/>
            geolocation Speed: {position.coords.speed} <br/><br/>
            geolocation accuracy: {position.coords.accuracy} <br/><br/>
            Number of notes in bounds: {notesInBounds?.length} <br/><br/>
            Number of notes in proximity: {notesInBounds?.filter(marker => marker.inProximity === true).length}  <br/><br/>
          </p>
          
          <ul>
            {notesInBounds?.filter(marker => marker.inProximity === true)?.map((el, idx) => 
              <li key={idx}>
                  {el.noteText}<br/> Distance: {el.distance.toFixed(3)} meters <hr/> 
              </li>
            )}
          </ul>

        </div>}
    </>
  )
}