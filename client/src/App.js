import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { StateProvider } from './utils/GlobalState';
import GpsProvider from './components/GpsProvider';
import NotesInBoundsProvider from './components/NotesInBoundsProvider';
import ErrorContainer from './components/ErrorContainer';
import TopNavContainer from './components/TopNavContainer';
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

        <GpsProvider />
        <NotesInBoundsProvider />

        <TopNavContainer />
        <ErrorContainer />
        <MapContainer />
        <DrawerContainer />

      </StateProvider>
    </ApolloProvider>
  )
}

export default App;