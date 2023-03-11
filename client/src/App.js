import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { StateProvider } from './utils/GlobalState';
import TrackGps from './components/TrackGps';
import TopNav from './components/TopNav';
import MapContainer from './components/MapContainer';
import DrawerContainer from './components/DrawerContainer';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = createHttpLink({uri: '/graphql'});
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


function App() {
  return (
    <ApolloProvider client={client}>
      <StateProvider>
        <TrackGps />
        <TopNav />
        <MapContainer />
        <DrawerContainer />
      </StateProvider>
    </ApolloProvider>
  )
}

export default App;