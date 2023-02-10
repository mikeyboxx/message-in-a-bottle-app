import {useState, useCallback, useEffect, useMemo} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';

export default function MapContainer() {
  console.log('MapContainer');
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [prevPosition, setPrevPosition] = useState(null);
  const [bounds, setBounds] = useState(null);
  
  // user icon object
  const userIcon =  useMemo(() => { 
    console.log('useMemo userIcon');
    return {
      fillColor: '#4285F4',
      fillOpacity: 1,
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeColor: 'rgb(255,255,255)',
      strokeWeight: 4,
    };
  }, []);
  
  // note icon object
  // const noteIcon = useMemo(() => { 
  //   console.log('useMemo noteIcon');
  //   return {
  //     fillColor: "black",
  //     fillOpacity: .7,
  //     scale: .03,
  //     // bird
  //     path: "M160.8 96.5c14 17 31 30.9 49.5 42.2c25.9 15.8 53.7 25.9 77.7 31.6V138.8C265.8 108.5 250 71.5 248.6 28c-.4-11.3-7.5-21.5-18.4-24.4c-7.6-2-15.8-.2-21 5.8c-13.3 15.4-32.7 44.6-48.4 87.2zM320 144v30.6l0 0v1.3l0 0 0 32.1c-60.8-5.1-185-43.8-219.3-157.2C97.4 40 87.9 32 76.6 32c-7.9 0-15.3 3.9-18.8 11C46.8 65.9 32 112.1 32 176c0 116.9 80.1 180.5 118.4 202.8L11.8 416.6C6.7 418 2.6 421.8 .9 426.8s-.8 10.6 2.3 14.8C21.7 466.2 77.3 512 160 512c3.6 0 7.2-1.2 10-3.5L245.6 448H320c88.4 0 160-71.6 160-160V128l29.9-44.9c1.3-2 2.1-4.4 2.1-6.8c0-6.8-5.5-12.3-12.3-12.3H400c-44.2 0-80 35.8-80 80zm80 16c-8.8 0-16-7.2-16-16s7.2-16 16-16s16 7.2 16 16s-7.2 16-16 16z",
  //   };
  // }, []);

  
  // first time get current gps position
  useEffect(()=>{
    // console.log('useEffect []');
    const navId = navigator.geolocation.watchPosition(
      newPos => {
        console.log('watchPosition');
        setPosition(newPos);

        setPrevPosition(prev => {
          if (!prev){
            return newPos;
          }
          // const dist = getDistance(prev, newPos);
          const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(prev.coords.latitude, prev.coords.longitude),
            new window.google.maps.LatLng(newPos.coords.latitude, newPos.coords.longitude)
          );

          // cache the prev position and change it only if user travelled more than 10 meters
          if (dist > 10) {
            return newPos;
          }
          else { 
            return prev;
          }
        })
      },
      // need to handle err in html
      err => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )

    return () => navigator.geolocation.clearWatch(navId);
  },[]);


  const onLoad = useCallback(
    function onLoad(map){
      console.log('onLoad map');
      window.google.maps.event.addListener(map, "bounds_changed", () => {
        console.log('bounds_changed');
        
        const {Ma, Ya} = map.getBounds();
        
        const swBound = {
          lat: Ya.lo,
          lng: Ma.lo
        };
  
        const neBound = {
          lat: Ya.hi,
          lng: Ma.hi
        };
        
        // set the bounds state variable, to be used to query the database for notes
        setBounds(oldBounds => {
          // if map bounds are different than return the new bounds
          if (oldBounds?.SW.lat !== swBound.lat ||
              oldBounds?.SW.lng !== swBound.lng ||
              oldBounds?.NE.lat !== neBound.lat ||
              oldBounds?.NE.lng !== neBound.lng) {
                console.log('new bounds');
                return {
                  SW: swBound,
                  NE: neBound
                }
          } else {
            console.log('old bounds');
            return oldBounds;
          }
        });
      }); 
      
      setMap(map);
    },[])
    
  

  return (
    <>
      {(!position) && 'Loading...'}

      {position && 
        <GoogleMap
          options={{
            zoom: map?.zoom || 20,
            heading: position?.coords.heading,
            center:  {
              lat: position?.coords.latitude,
              lng: position?.coords.longitude,
            }, 
            // disableDefaultUI: true,
            mapId: '8dce6158aa71a36a',
            tilt: 45
          }}
          mapContainerStyle={{ 
            height: '100vh', 
            width: '100%', 
            position: 'relative' 
          }}
          onLoad={onLoad}
        >
          <Marker
            position={{
              lat: position?.coords.latitude,
              lng: position?.coords.longitude,
            }}
            icon={userIcon}
          />

        </GoogleMap>}
    </>
  )
}