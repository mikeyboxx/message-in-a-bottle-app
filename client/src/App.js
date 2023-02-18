import {useState, useEffect} from 'react';
import {useJsApiLoader} from '@react-google-maps/api';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';
import MapContainer from './components/MapContainer';
// import {getLatLonBounds} from './utils/trigonometry';


// used by google maps api param
const libraries = ['geometry'];

const httpLink = createHttpLink({
  uri: '/graphql',
});

// const authLink = setContext((_, { headers }) => {
  //   const token = localStorage.getItem('id_token');
  //   return {
    //     headers: {
      //       ...headers,
      //       authorization: token ? `Bearer ${token}` : '',
      //     },
      //   };
      // });

      // connect to graphQL on the server
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
    libraries: libraries
  });

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition( 
      pos => {
        // console.log('getCurrentPosition');
        setStartingPosition(pos);
      },
      err => console.log(err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  },[]);

  return (
    <ApolloProvider client={client}>
      <div>
        {(!isLoaded || !startingPosition) && 'Loading...'}

        {loadError && 'Error Loading Google Maps!'}

        {(isLoaded && startingPosition) && <MapContainer startingPosition={startingPosition}/>}
      </div>
    </ApolloProvider>
  );
}

export default App;
