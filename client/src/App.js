import {useState, useEffect, useCallback} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';

import MapContainer from './components/MapContainer';
import TopNav from './components/TopNav';
import DrawerContainer from './components/DrawerContainer';
import SignIn from './components/SignIn';
import Auth from './utils/auth';

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
  // link: httpLink,
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
  const [openSignIn, setOpenSignIn] = useState(userAction === 'signIn');


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

  useEffect(()=>{
    if (userAction === 'signIn') {
      setOpenSignIn(true);
    }

    if (userAction === 'signOut') {
      Auth.logout();
    }

    if (userAction === 'loggedIn') {
      setOpenSignIn(false);
    }

    // setUserAction(null);
  },[userAction]);


  return (
    <ApolloProvider client={client}>
        {(isLoaded && position) && 
          <Box 
            sx={{
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
            }}>

            <TopNav userActionHandler={setUserAction}/> 

            <MapContainer 
              position={position} 
              userAction={userAction}
              userActionHandler={setUserAction} 
              notesInProximityHandler={setNotesInProximity}  
            />
            
            {notesInProximity.length > 0 && <DrawerContainer notesInProximity={notesInProximity}/>}

          </Box>
        }
          {<Dialog 
            open={openSignIn}
            onClose={()=>{
              setOpenSignIn(false);
              setUserAction('cancelledSignIn')
            }}
            
            >
            {/* <Button >X</Button> */}
            <SignIn userActionHandler={setUserAction} />
          </Dialog>}


        {loadError && 
          <Alert variant="filled" severity="error">
            Error loading Google Maps!
          </Alert>
        }

        {gpsLoadError && 
          <Alert variant="filled" severity="error">
            {gpsLoadError}
          </Alert>
        }

        {(!isLoaded || !position) && 
          <CircularProgress/>
        }
    </ApolloProvider>
  );
}

export default App;
