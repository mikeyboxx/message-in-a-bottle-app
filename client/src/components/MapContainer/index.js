import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {Button} from "react-bootstrap";
import {Journals} from 'react-bootstrap-icons';
import {GoogleMap, Marker} from '@react-google-maps/api';
import { useLazyQuery } from '@apollo/client';
import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';
// import noteImg from '../../img/note.png';


export default function MapContainer({startingPosition}) {
  const [position, setPosition] = useState(null);
  const [notesInBounds, setNotesInBounds] = useState(null);
  const [getNotesInBounds, {data}] = useLazyQuery(QUERY_NOTES_IN_BOUNDS,{
    fetchPolicy: 'network-only'
  });
  
  const map = useRef(null);
  const prevPosition = useRef({});
  const numberOfNotesInProximity = useRef(0);
  const zoomChanged = useRef(false);
  const boundsChanged = useRef(false);
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

  
  
  // track google map events
  const onDragEnd = useCallback(() => {/*console.log('onDragEnd');*/ return dragEnd.current = true},[]);
  const onZoomChanged = useCallback(() => {/*console.log('onZoomChanged');*/ return zoomChanged.current = true},[]);
  const onBoundsChanged = useCallback(() => {/*console.log('onBoundsChanged');*/ return boundsChanged.current = true},[]);

  // initialize google map and save in useRef
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

  // check if specific google maps events were fired, in order to refresh data based on the new map bounds
  const onIdle = useCallback(() => {
    // console.log('onIdle');
    if (map.current && 
      (zoomChanged.current === true || dragEnd.current === true || boundsChanged.current === true)){
      const newBounds = map.current.getBounds();
      if (newBounds) {
        getNotesInBounds({variables: {
          swLat: newBounds.getSouthWest().lat(), 
          swLng: newBounds.getSouthWest().lng(), 
          neLat: newBounds.getNorthEast().lat(), 
          neLng: newBounds.getNorthEast().lng()
        }});
      }
    }
    zoomChanged.current = false;
    dragEnd.current = false;
    boundsChanged.current = false;
  },[getNotesInBounds]);

  // after initial render, start monitoring the user's gps location
  useEffect(()=>{
    const navId = navigator.geolocation.watchPosition( 
      newPos => 
        setPosition(oldPos => {
          if (oldPos?.coords.latitude !== newPos.coords.latitude || 
            oldPos?.coords.longitude !== newPos.coords.longitude){
            return newPos;
          } else {
            return oldPos;
          }
        }),
      err => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );
    return () => navigator.geolocation.clearWatch(navId);
  },[]);

  // each time gps position changes, save the position, and every 20 meters pan the map (chg center)
  // if gps accuracy is less than 13 meters, change the heading of the map
  // do not pan or change heading, if user gps position is not in bounds of the google map, due to zoom or drag
  useEffect(() => {
    // console.log('useEffect [position]');
    if (position) {
      if (Object.keys(prevPosition.current).length === 0){
        prevPosition.current.lat = position.coords.latitude;
        prevPosition.current.lng = position.coords.longitude;
      };

      if (map.current){
        const newBounds = map.current.getBounds();
        if (newBounds) {
          const isInBounds = 
            position.coords.latitude > newBounds.getSouthWest().lat() && 
            position.coords.longitude >  newBounds.getSouthWest().lng() && 
            position.coords.latitude < newBounds.getNorthEast().lat() && 
            position.coords.longitude <  newBounds.getNorthEast().lng();

          const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
            {lat: prevPosition.current.lat, lng: prevPosition.current.lng},
            {lat: position.coords.latitude, lng: position.coords.longitude});

          if (dist > 20) {
            prevPosition.current.lat = position.coords.latitude;
            prevPosition.current.lng = position.coords.longitude;
            isInBounds && map.current.panTo({lat: position.coords.latitude, lng: position.coords.longitude})
          }

          isInBounds && position.coords.accuracy < 13 && map.current.setHeading(position.coords.heading);
        }
      }
    }
  },[position]);

  // each time there is new data from the database or the gps position has changed, calculate the distance and whether the note is in proximity of the user 
  useEffect(() => {
    // console.log('useEffect [data, position]');
    if (data?.notesInBounds) {
      setNotesInBounds(data?.notesInBounds);
    }
    // if (data?.notesInBounds) {
    //   const arr = data.notesInBounds.map(el => {
    //     const { note } = el;
    //     const distance =  window.google.maps.geometry.spherical.computeDistanceBetween(
    //       {lat: position.coords.latitude, lng: position.coords.longitude},
    //       {lat: note.lat, lng: note.lng});
    //     return {
    //       note,
    //       distance,
    //       inProximity: distance < 20
    //     }
    //   });
    //   numberOfNotesInProximity.current = arr.filter(el => el.inProximity === true).length;
    //   setNotesInBounds(arr);
    // }
  },[data]);


  return (
    <>
     {/* <div style={{height: '100%'}}> */}
     <div>
      {position && 
        <GoogleMap
          id={'googleMap'}
          options={{ 
            disableDefaultUI: true,
            minZoom: 16,
            mapId: '8dce6158aa71a36a',
            // maxZoom: 20,
          }}
          mapContainerStyle={{ 
            height: `${window.screen.height >= window.innerHeight ? 
                       window.innerHeight : 
                       window.screen.height - (window.innerHeight - window.screen.height)}px`, 
            width: `${window.screen.width >= window.innerWidth ? 
                      window.innerWidth : 
                      window.screen.width - (window.innerWidth - window.screen.width)}px`
          }}
          onLoad={onLoad}
          onIdle={onIdle}
          onBoundsChanged={onBoundsChanged}
          onZoomChanged={onZoomChanged}
          onDragEnd={onDragEnd}
        >
          <Marker
            position={position ? 
              {lat: position.coords.latitude, lng: position.coords.longitude} :
              {lat: startingPosition.coords.latitude, lng: startingPosition.coords.longitude}}
            icon={{...userIcon, path: window.google.maps.SymbolPath.CIRCLE}}
          />
          
          {notesInBounds?.map((el, idx) => {
            const {note: {noteText, lat, lng}} = el;
            return (
              <Marker
                key={idx}
                options={{optimized: true}}
                position={{lat, lng}}
                icon={{...noteIcon, fillColor: (()=>{return window.google.maps.geometry.spherical.computeDistanceBetween(
                  {lat: position.coords.latitude, lng: position.coords.longitude},
                  {lat, lng})})() < 50 ? "red" : "black"}}
                // icon={"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"}
                // icon={noteImg}
                title={noteText}  
              />)
          })}

          {map.current && notesInBounds && 
            <Button 
                size="lg" 
                variant="info"
                style={{
                  position: 'absolute',
                  border: 'none',
                  borderRadius: 30,
                  boxShadow: '5px 5px 5px gray',
                  bottom: 30,
                  left: 20,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 18,
                  paddingRight: 18,
                  fontWeight: 'bold',
                  backgroundColor: 'white',
                  color: 'purple',
                  fontSize: '.85em',
                  cursor: 'pointer'
                }}
              >
                <Journals /> Create Note
            </Button>}
      
            {map.current && notesInBounds?.filter(note => note.inProximity === true).length > 0 && 
              <Button 
                size="lg" 
                variant="info"
                style={{
                  position: 'absolute',
                  border: 'none',
                  borderRadius: 30,
                  boxShadow: '5px 5px 5px gray',
                  bottom: 30,
                  left: 210,
                  paddingTop: 8,
                  paddingBottom: 8,
                  paddingLeft: 18,
                  paddingRight: 18,
                  fontWeight: 'bold',
                  backgroundColor: 'white',
                  color: 'purple',
                  fontSize: '.85em',
                  cursor: 'pointer'
                }}
              >
                <Journals /> Pickup {numberOfNotesInProximity.current + ' Note' + (numberOfNotesInProximity.current > 1 ? 's' : '')}
              </Button>}
        </GoogleMap>}

      
      

      {/* below code is used for debugging */}
      {map.current && position && notesInBounds &&     
        <div 
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: '200px',
            height: '400px',
            padding: 5,
            color: 'black',
            fontWeight: 'bold',
            fontSize: '.85em',
            overflow: 'auto'
          }}>
            
          <p>
            {/* DevicePixelRatio: {window.devicePixelRatio} <br/> */}
            {/* googleMap height: {document.getElementById('googleMap').getBoundingClientRect().height
}<br/>
            googleMap width: {document.getElementById('googleMap').getBoundingClientRect().width
}<br/><br/> */}
            {/* VisualViewport height: {window.visualViewport.innerHeight} <br/> 
            VisualViewport width: {window.visualViewport.innerWidth} <br/> 
            VisualViewport offsetTop: {window.visualViewport.offsetTop} <br/> 
            VisualViewport offsetLeft: {window.visualViewport.offsetLeft} <br/> 
            VisualViewport scale: {window.visualViewport.scale} <br/>  */}
            {/* Inner height: {window.innerHeight} <br/> 
            Inner width: {window.innerWidth} <br/> <br/>
            Outer height: {window.outerHeight} <br/> 
            Outer width: {window.outerWidth} <br/> <br/>
            Screen height:  {window.screen.height} <br/>
            Screen width:  {window.screen.width} <br/><br/>
            Available height: {window.screen.availHeight} <br/>
            Available width: {window.screen.availWidth} <br/> <br/>
            Body client height: {document.querySelector('body').clientHeight} <br/>
            Body client width: {document.querySelector('body').clientWidth} <br/><br/> */}
            Zoom: {map.current.zoom} <br/> <br/>
            Distance travelled: {window.google.maps.geometry.spherical.computeDistanceBetween(
              {lat: prevPosition.current.lat || 0, lng: prevPosition.current.lng || 0},
              {lat: position.coords.latitude, lng: position.coords.longitude})}<br/><br/>

            Curr Lat: {position.coords.latitude}<br/>
            Curr Lng: {position.coords.longitude}<br/><br/>

            Heading: {position.coords.heading} <br/><br/>
            Speed: {position.coords.speed} <br/><br/>
            Aaccuracy: {position.coords.accuracy} <br/><br/>

            # of notes in bounds: {notesInBounds?.length} <br/><br/>
            # of notes in proximity: {notesInBounds?.filter(marker => marker.inProximity === true).length}  <br/><br/>
          </p>
          
          <ul>
            {notesInBounds
              ?.filter(marker => marker.inProximity === true)
              ?.map((el, idx) => { 
                const {note} = el;
                return (
                  <li key={idx}>
                      {note.noteText}<br/> Distance: {window.google.maps.geometry.spherical.computeDistanceBetween(
          {lat: position.coords.latitude, lng: position.coords.longitude},
          {lat: note.lat, lng: note.lng}).toFixed(3)} meters <hr/> 
                  </li>)
                })}
          </ul>

        </div>}
      </div>
    </>
  )
}