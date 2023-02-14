import {useState, useCallback, useEffect, useMemo} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';
import { useQuery } from '@apollo/client';
import { QUERY_NOTES_IN_BOUNDS } from '../../utils/queries';

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
  scale: .03,
  path: "M160.8 96.5c14 17 31 30.9 49.5 42.2c25.9 15.8 53.7 25.9 77.7 31.6V138.8C265.8 108.5 250 71.5 248.6 28c-.4-11.3-7.5-21.5-18.4-24.4c-7.6-2-15.8-.2-21 5.8c-13.3 15.4-32.7 44.6-48.4 87.2zM320 144v30.6l0 0v1.3l0 0 0 32.1c-60.8-5.1-185-43.8-219.3-157.2C97.4 40 87.9 32 76.6 32c-7.9 0-15.3 3.9-18.8 11C46.8 65.9 32 112.1 32 176c0 116.9 80.1 180.5 118.4 202.8L11.8 416.6C6.7 418 2.6 421.8 .9 426.8s-.8 10.6 2.3 14.8C21.7 466.2 77.3 512 160 512c3.6 0 7.2-1.2 10-3.5L245.6 448H320c88.4 0 160-71.6 160-160V128l29.9-44.9c1.3-2 2.1-4.4 2.1-6.8c0-6.8-5.5-12.3-12.3-12.3H400c-44.2 0-80 35.8-80 80zm80 16c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16s-7.2 16-16 16z",
};

// default GoogleMap options
const defaultMapOptions = { 
  disableDefaultUI: true,
  mapId: '8dce6158aa71a36a',
};

// default GoogleMap styles
const mapContainerStyle = { 
  height: '100vh', 
  width: '100%', 
  position: 'relative' 
};


export default function MapContainer({startingPosition}) {
  // console.log('MapContainer');

  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [prevPosition, setPrevPosition] = useState(null);
  const [bounds, setBounds] = useState(null);

  const { loading, data } = useQuery(QUERY_NOTES_IN_BOUNDS, {
    variables: {
      currLat: prevPosition?.coords.latitude || 0,
      currLng: prevPosition?.coords.longitude || 0,
      swLat: bounds?.SW.lat || 0, 
      swLng: bounds?.SW.lng || 0, 
      neLat: bounds?.NE.lat || 0, 
      neLng: bounds?.NE.lng || 0
    }
  });

  const notesInBounds = data?.notesInBounds || [];

  

  
  // first time get current gps position
  useEffect(()=>{
    // console.log('useEffect []');
    const navId = navigator.geolocation.watchPosition( 
      newPos => {
        // console.log('watchPosition');

        let pos;

        setPosition(oldPos => {
          if (oldPos?.coords.latitude !== newPos.coords.latitude || 
            oldPos?.coords.longitude !== newPos.coords.longitude){
            pos = newPos;
          } else {
            pos = oldPos;
          };
          return pos;
        });

        setPrevPosition(prevPos => {
          if (!prevPos){
            return pos;
          }

          const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(prevPos.coords.latitude, prevPos.coords.longitude),
            new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          
          // console.log('Distance between prevPosition: ', dist);

          if (dist > 10) {
            return pos;
          } else {
            return prevPos;
          }
        });
      },
      err => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
      );
      
      return () => navigator.geolocation.clearWatch(navId);
    },[]);

    
  const onLoad = useCallback(map => {
    // console.log('onLoad');
      
    map.setOptions({
      zoom: 20,
      heading: startingPosition.coords.heading,
      center:  {
        lat: startingPosition.coords.latitude,
        lng: startingPosition.coords.longitude,
      }
    });

    setMap(map);
  },[startingPosition]);


  const onIdle = useCallback( () => {
    // console.log('onIdle');

    const newBounds = map.getBounds();
    const neBound = newBounds.getNorthEast();
    const swBound = newBounds.getSouthWest();

    // set the bounds state variable, to be used to query the database for notes
    setBounds(oldBounds => {
      // if map bounds are different than return the new bounds
      if (oldBounds?.SW.lat !== swBound.lat() ||
          oldBounds?.SW.lng !== swBound.lng() ||
          oldBounds?.NE.lat !== neBound.lat() ||
          oldBounds?.NE.lng !== neBound.lng()) {
          return {
            SW: {
              lat: swBound.lat(),
              lng: swBound.lng()
            },
            NE: {
              lat: neBound.lat(),
              lng: neBound.lng()
            },
          }
      } else {
        return oldBounds;
      }
    });
  },[map])

  

  return (
    <>
      {(!position || loading) && 'Loading...'}

      {position && 
        <GoogleMap
          options={defaultMapOptions}
          mapContainerStyle={mapContainerStyle}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <Marker
            position={{
              lat: position?.coords.latitude,
              lng: position?.coords.longitude,
            }}
            icon={{
              ...userIcon,
              path: window.google.maps.SymbolPath.CIRCLE
            }}
          />
          
          {notesInBounds?.map((note, idx) =>
            <Marker
              key={idx}
              position={note.position}
              label={note.id.toString()}
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
            width: '300px',
            height: '400px',
            backgroundColor: 'black',
            opacity: .3,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '.85em',
            overflow: 'auto'
          }}>

            
            <p style={{
              color: 'white',
              fontWeight: 'bold'
              }}
            >
              Curr Lat: {position?.coords.latitude}<br/>
              Curr Lng: {position?.coords.longitude}<br/><br/>
              SW Lat: {bounds?.SW.lat} <br/> SW Lng: {bounds?.SW.lng} <br/><br/>
              NE Lat: {bounds?.NE.lat} <br/> NE Lng: {bounds?.NE.lng} <br/><br/>
              geolocation Heading: {position.coords.heading} <br/><br/>
              geolocation Speed: {position.coords.speed} <br/><br/>
              geolocation accuracy: {position.coords.accuracy} <br/><br/>
              Number of notes in bounds: {notesInBounds?.length} <br/><br/>
              Number of notes in proximity: {notesInBounds?.filter(marker => marker.inProximity === true).length}  <br/><br/>
            </p>
            

            <ul>
              {notesInBounds?.filter(marker => marker.inProximity === true)?.map(el => 
                <li key={el.id}>
                    Note #: {el.id} <br/> Distance: {el.distance.toFixed(3)} meters <hr/> 
                </li>
              )}
            </ul>  
        </div>}
    </>
  )
}