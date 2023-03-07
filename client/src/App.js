import {useState, useEffect, useCallback, useMemo} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import MapContainer from './components/MapContainer';
import TopNav from './components/TopNav';
import DrawerContainer from './components/DrawerContainer';
import SignIn from './components/SignIn';

// import {getLatLonBounds} from './utils/trigonometry';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// used by google maps api param
const googleLibraries = ['geometry'];
const httpLink = createHttpLink({uri: '/graphql'});
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  // console.log('App');
  const [position, setPosition] = useState(null);
  const [gpsLoadError, setGpsLoadError] = useState(null);
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: googleLibraries
  });
  const [userAction, setUserAction] = useState('location');
  const [notesInProximity, setNotesInProximity] = useState([]);

  const boxStyle = useMemo(()=>({
    display: 'flex', 
    flexDirection: 'column', 
    height:
      // this fixes google chrome mobile issue with page height being > screen height
      `${
        (/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) 
          ? window.screen.height >= window.innerHeight 
            ? window.innerHeight 
            : window.screen.height - (window.innerHeight - window.screen.height) 
          : Math.min(window.screen.height, window.innerHeight))
      }px`, 
  }),[]);

  const getGPSLocation = useCallback(() => {
    const navId = navigator.geolocation.watchPosition( 
      newPos => 
        setPosition(oldPos => 
          (oldPos?.coords.latitude !== newPos.coords.latitude || 
           oldPos?.coords.longitude !== newPos.coords.longitude) ? newPos : oldPos),
      err => {console.log(err); setGpsLoadError(err);},
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: Infinity
      }
    );
    return () => {
      navigator.geolocation.clearWatch(navId);
    }
  },[])

  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);



  return (
    <ApolloProvider client={client}>
      <CssBaseline />
      <SignIn userAction={userAction} userActionHandler={setUserAction} />

      {(isLoaded && position) && 
        <Box sx={boxStyle}>
          <TopNav userAction={userAction} userActionHandler={setUserAction}/> 
          <MapContainer userAction={userAction} userActionHandler={setUserAction}
            position={position} 
            notesInProximityHandler={setNotesInProximity}  
          />
          {notesInProximity.length > 0 && <DrawerContainer notesInProximity={notesInProximity}/>}
        </Box>
      }

      {loadError && 
        <Alert variant="filled" severity="error">
          Error loading Google Maps! <br/>
          {loadError.message}
        </Alert>
      }

      {gpsLoadError && 
        <Alert variant="filled" severity="error">
          GPS error! <br/>
          {gpsLoadError.message}
        </Alert>
      }

      {(!isLoaded || !position) && 
        <CircularProgress/>
      }
    </ApolloProvider>
  );
}

export default App;
