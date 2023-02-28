import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {Button} from "react-bootstrap";
import {Journals} from 'react-bootstrap-icons';
import {GoogleMap, Marker} from '@react-google-maps/api';
import { useLazyQuery } from '@apollo/client';
import LabelBottomNavigation from '../LabelBottomNavigation';
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

// theme used by all buttons
const buttonStyle = {
  position: 'absolute',
  border: 'none',
  borderRadius: 30,
  boxShadow: '5px 5px 5px gray',
  fontWeight: 'bold',
  backgroundColor: 'white',
  color: 'purple',
  fontSize: '.85em',
  cursor: 'pointer'
};

// buttons displayed over the map
const mapButtonStyle =  {
  bottom: 70,
  paddingTop: 6,
  paddingBottom: 6,
  paddingLeft: 15,
  paddingRight: 15,
};

// Create Note button style
// const createNoteButtonStyle =  {
//   ...buttonStyle, 
//   ...mapButtonStyle, 
//   left: 20
// };
// Pickup Note button style
const pickupNoteButtonStyle =  {
  ...buttonStyle, 
  ...mapButtonStyle, 
  left: 20
};

// close button in notes list
const closeButtonStyle =  {
  // marginLeft: '75px', 
  top: 10,
  right: 10,
};

// minimum zoom to retrieve data from database
const MIN_ZOOM = 15;
const DEFAULT_ZOOM = 18;

export default function MapContainer({startingPosition}) {
  console.log('MapContainer');
  // console.log(startingPosition);
  const [position, setPosition] = useState(null);
  const [notesInBounds, setNotesInBounds] = useState(null);
  const [notesInProximityListVisible, setNotesInProximityListVisible] = useState('hidden');
  const [bottomNavigationAction, setBottomNavigationAction] = useState('location');
  
  const map = useRef(null);
  const numberOfNotesInProximity = useRef(0);
  const zoomChanged = useRef(false);
  const dragEnd = useRef(false);
  
  const [getNotesInBounds, {data}] = useLazyQuery(QUERY_NOTES_IN_BOUNDS,{fetchPolicy: 'network-only'});

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

  const notesInProximityListStyle = useMemo(()=>({
    position: 'absolute',
    border: '1px solid gray',
    borderRadius: 30,
    boxShadow: '5px 5px 5px gray',
    margin: 0,
    paddingTop: 8,
    fontWeight: 'bold',
    backgroundColor: 'white',
    color: 'purple',
    fontSize: '.85em',
    width: '200px',
    height: '400px',
    overflow: 'auto',
    visibility: notesInProximityListVisible,
    top: (Math.floor(window.screen.height >= window.innerHeight ? 
      window.innerHeight : 
      window.screen.height - (window.innerHeight - window.screen.height))/2) - 200,
    left: (Math.floor(window.screen.width >= window.innerWidth ? 
      window.innerWidth : 
      window.screen.width - (window.innerWidth - window.screen.width))/2) - 100
  }),[notesInProximityListVisible]);


  // initial map options (zoom, heading, center of the map)
  const initialMapOptions = useMemo(() => ({
    zoom: DEFAULT_ZOOM,
    heading: startingPosition.coords.heading,
    center:  {
      lat: startingPosition.coords.latitude,
      lng: startingPosition.coords.longitude,
    }
  }),[startingPosition]);

  // initialize google map and save in useRef
  const onLoad = useCallback(gMap => {
    gMap.setOptions(initialMapOptions);
    map.current = gMap;
    map.current.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
    map.current.setHeading(position.coords.heading);
  },[position, initialMapOptions]);

  // track google map events
  const onDragEnd = useCallback(() => dragEnd.current = true,[]);
  const onZoomChanged = useCallback(() => zoomChanged.current = true,[]);
  
  // check if specific google maps events were fired, in order to refresh data based on the new map bounds
  const onIdle = useCallback(() => {
    if (zoomChanged.current || dragEnd.current ){
      setBottomNavigationAction(null);
      if (map.current.zoom > MIN_ZOOM) {
        const newBounds = map.current.getBounds();
        newBounds && getBoundsData(newBounds)
      } 
      else {
        setNotesInBounds([]);
      }
    }
    zoomChanged.current = false;
    dragEnd.current = false;
  },[getBoundsData]);
  
  // retrieve data from the database every 60 seconds, if zoom level is acceptable
  // after initial render, start monitoring the user's gps location
  useEffect(()=>{
    const timer = setInterval(()=>{
      if (map.current.zoom > MIN_ZOOM) {
        const newBounds = map.current.getBounds();
        newBounds && getBoundsData(newBounds);
      }
    },60000);
    
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
      clearInterval(timer);
    }
  },[getBoundsData]);


  useEffect(() => {
    if (position && map.current){
      const newBounds = map.current.getBounds();
      if (newBounds) {
        // check if user is in bounds of the google map
        const isInBounds = 
          position.coords.latitude > newBounds.getSouthWest().lat() && 
          position.coords.longitude >  newBounds.getSouthWest().lng() && 
          position.coords.latitude < newBounds.getNorthEast().lat() && 
          position.coords.longitude <  newBounds.getNorthEast().lng();
        
        // pan and change heading of google map, if user is in bounds and gps has good accuracy, expressed in meters 
        if (isInBounds && position.coords.accuracy < 10) { 
          map.current.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
          map.current.setHeading(position.coords.heading);
        }
      }
    }
  },[position]);

  // each time there is new data from the database or the gps position has changed, calculate the distance and whether the note is in proximity of the user, and set notesInBounds state variable, causing a re-render 
  useEffect(() => {
    if (data?.notesInBounds && position && map.current.zoom > MIN_ZOOM) {
      numberOfNotesInProximity.current = 0;
      const arr = data.notesInBounds.map(({note}) => {
        const distance =  window.google.maps.geometry.spherical.computeDistanceBetween(
          {lat: position.coords.latitude, lng: position.coords.longitude},
          {lat: note.lat, lng: note.lng});
          distance < 20 && ++numberOfNotesInProximity.current;
        return {
          note,
          distance,
          inProximity: distance < 20
        }
      });
      // if there are no notes in proximty, hide the pickup notes list
      numberOfNotesInProximity.current  === 0 && setNotesInProximityListVisible('hidden');
      setNotesInBounds(arr);
    }
  },[position, data]);

  useEffect(()=>{
    if (bottomNavigationAction === 'location' && map.current){
      map.current.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
      map.current.setHeading(position.coords.heading);
      map.current.setZoom(DEFAULT_ZOOM);
    }
  },[position, bottomNavigationAction])


  return (
    <div style={{height: '100%'}}>
        {position &&  
          <GoogleMap    
            id={'googleMap'}
            options={defaultMapOptions}
            mapContainerStyle={{ 
              // this fixes google chrome mobile issue with page height being > screen height
              height: `${/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) ?
                          window.screen.height >= window.innerHeight ? 
                            window.innerHeight : 
                            window.screen.height - (window.innerHeight - window.screen.height) :  
                          Math.min(window.screen.height, window.innerHeight)}px`, 
              width: `100%`
            }}
            onLoad={onLoad}
            onIdle={onIdle}
            onZoomChanged={onZoomChanged}
            onDragEnd={onDragEnd}
          >
            <Marker
              position={{lat: position.coords.latitude, lng: position.coords.longitude}} 
              icon={{...userIcon, path: window.google.maps.SymbolPath.CIRCLE}}
            />
            
            {notesInBounds?.map(({note: {noteText, noteAuthor, lat, lng, createdTs}, inProximity, distance}, idx) => {
              const dt = new Date(createdTs);
              const dtString = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
              return (
                <Marker
                  key={idx}
                  options={{optimized: true}}
                  position={{lat, lng}}
                  icon={{...noteIcon, fillColor: inProximity  ? "red" : "black"}}  // temporary - changes color of birdie 
                  title={noteText + '\nBy: ' + noteAuthor + '\nOn: ' + dtString + '\nDistance: ' + distance.toFixed(1) + ' meters'}  
                />)
            })}

        
            {map.current && notesInBounds && numberOfNotesInProximity.current > 0 && 
              <Button 
                size="lg" 
                variant="info"
                style={pickupNoteButtonStyle}
                onClick={()=>setNotesInProximityListVisible('visible')}
              >
                <Journals /> Pickup {numberOfNotesInProximity.current + ' Note' + (numberOfNotesInProximity.current > 1 ? 's' : '')}
              </Button>
            }
          </GoogleMap>}
          <LabelBottomNavigation handler={setBottomNavigationAction}/>

        {map.current && notesInBounds && numberOfNotesInProximity.current > 0 && position &&    
          <div style={notesInProximityListStyle}>
            <ul style={{listStyleType: 'none', margin: 0, padding: 15}}>
              {notesInBounds
                .filter(note => note.inProximity === true)
                .map(({note: {noteText, noteAuthor, createdTs}, distance}, idx) => { 
                  const dt = new Date(createdTs);
                  const dtString = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
                  return ( 
                    <li key={idx}>
                        {noteText}<br/><br/> 
                        By: {noteAuthor} On: {dtString}<br/> 
                        Distance: {distance.toFixed(1)} meters <hr/> 
                    </li>)
                })}
            </ul>
            <Button 
              style={{...buttonStyle, ...closeButtonStyle}}
              onClick={(e)=>{
                e.preventDefault();
                setNotesInProximityListVisible('hidden');
              }}
            >
              x
            </Button>
          </div>}
    </div>
  )
}

// {/* below code is used for debugging */}
//         {/* <p>
//               Zoom: {map.current.zoom.toFixed(3)} <br/> <br/>
//               Distance travelled: {window.google.maps.geometry.spherical.computeDistanceBetween(
//                 {lat: prevPosition.current.lat || 0, lng: prevPosition.current.lng || 0},
//                 {lat: position.coords.latitude, lng: position.coords.longitude}).toFixed(3)}<br/><br/>

//               Curr Lat: {position.coords.latitude}<br/>
//               Curr Lng: {position.coords.longitude}<br/><br/>

//               Heading: {position.coords.heading?.toFixed(3)} <br/><br/>
//               Speed: {position.coords.speed?.toFixed(3)} <br/><br/>
//               Accuracy: {position.coords.accuracy?.toFixed(3)} <br/><br/>

//               # of notes in bounds: {notesInBounds?.length} <br/><br/>
//               # of notes in proximity: {notesInBounds?.filter(marker => marker.inProximity === true).length}  <br/><br/>
//             </p> */}