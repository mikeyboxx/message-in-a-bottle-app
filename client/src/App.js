import {useJsApiLoader} from '@react-google-maps/api';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';

// import { setContext } from '@apollo/client/link/context';

import MapContainer from './components/MapContainer';

// usd by google maps api param
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

const client = new ApolloClient({
  // link: authLink.concat(httpLink),
  link: httpLink,
  cache: new InMemoryCache(),
});

function App() {
  console.log('App');
  
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  return (
    <ApolloProvider client={client}>
      <div>
        {(!isLoaded) && 'Loading...'}

        {loadError && 'Error Loading Google Maps!'}

        {isLoaded && <MapContainer/>}
      </div>
    </ApolloProvider>
  );
}

export default App;
