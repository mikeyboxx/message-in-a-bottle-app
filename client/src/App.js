import {useState, useEffect, useCallback} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';
import MapContainer from './components/MapContainer';

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
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: googleLibraries
  });

  const getGPSLocation = useCallback(() => {
    // console.log('getGPSLocation');
    console.log(navigator.geolocation);
    navigator.geolocation.getCurrentPosition( 
      pos => {
        // console.log(pos);
        setStartingPosition((old)=> {
          // console.log(old);
          // console.log(pos);
          return pos
        });
      },
      err => console.log(err),
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
      {(!isLoaded || !startingPosition) && 'Loading...'}

      {loadError && 'Error Loading Google Maps!'}

      {(isLoaded && startingPosition) && 
      <div>
        <MapContainer startingPosition={startingPosition}/>
        
      </div>
      }
    </ApolloProvider>
  );
}

export default App;
