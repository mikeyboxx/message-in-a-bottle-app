import {useState, useEffect, useCallback} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import MapContainer from './components/MapContainer';
import BottomNav from './components/BottomNav';
import DrawerContainer from './components/DrawerContainer';

// import {getLatLonBounds} from './utils/trigonometry';

// const authLink = setContext((_, { headers }) => {
//   const token = localStorage.getItem('id_token');
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : '',
//     },
//   };
// });

// used by google maps api param
const googleLibraries = ['geometry'];
const httpLink = createHttpLink({uri: '/graphql'});
const client = new ApolloClient({
// link: authLink.concat(httpLink),
  link: httpLink,
  cache: new InMemoryCache(),
});

function App() {
  // console.log('App');
  const [startingPosition, setStartingPosition] = useState(null);
  const [gpsLoadError, setGpsLoadError] = useState(null);
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: googleLibraries
  });
  const [navigationAction, setNavigationAction] = useState(null);
  const [notesInProximity, setNotesInProximity] = useState([]);

  const getGPSLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition( 
      pos => setStartingPosition(pos),
      err => setGpsLoadError(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  },[])

  useEffect(()=>{
    getGPSLocation();
  },[getGPSLocation]);


  return (
    <ApolloProvider client={client}>
        {loadError && 
          <Alert variant="filled" severity="error">
            Error loading Google Maps!
          </Alert>}

        {gpsLoadError && 
          <Alert variant="filled" severity="error">
            {gpsLoadError}
          </Alert>}

        {(!isLoaded || !startingPosition) && <CircularProgress/>}

        {(isLoaded && startingPosition) && 
        <Box 
          sx={{
            display: 'flex', 
            flexDirection: 'column', 
            height: window.screen.height,
            // height: `${(/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) ?
            //               window.screen.height >= window.innerHeight ? 
            //                 window.innerHeight : 
            //                 window.screen.height - (window.innerHeight - window.screen.height) :  
            //               Math.min(window.screen.height, window.innerHeight))}px`, 

            // height: (()=>{
            //   console.log('window.screen.height= ', window.screen.height);
            //   console.log('window.innerHeight= ', window.innerHeight);
            //   console.log('window.outerHeight= ', window.outerHeight);
            //   return `${(/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) ?
            //   window.screen.height >= window.innerHeight ? 
            //     window.innerHeight : 
            //     window.screen.height - (window.innerHeight - window.screen.height) :  
            //   Math.min(window.screen.height, window.innerHeight))}px`;
            // })()
          }}>
          <BottomNav handler={setNavigationAction}/> 
          <MapContainer 
            startingPosition={startingPosition} 
            navActionHandler={setNavigationAction} 
            navAction={navigationAction}
            notesInProximityHandler={setNotesInProximity}  
          />
          {notesInProximity.length > 0 && <DrawerContainer notesInProximity={notesInProximity}/>}
        </Box>}
        
    </ApolloProvider>
  );
}

export default App;
