import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { StateProvider } from './utils/GlobalState';
import TrackGps from './components/TrackGps';
import MapContainer from './components/MapContainer';
import TopNav from './components/TopNav';

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
  console.log('App');

  return (
    <ApolloProvider client={client}>
      <StateProvider>
        <TrackGps />
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          height:
            // this fixes google chrome mobile issue with page height being > screen height
            `${(/mobile/.test(navigator.userAgent.toLowerCase()) && /chrome/.test(navigator.userAgent.toLowerCase()) 
                ? window.screen.height >= window.innerHeight 
                  ? window.innerHeight 
                  : window.screen.height - (window.innerHeight - window.screen.height) 
                : Math.min(window.screen.height, window.innerHeight))}px`, 
        }}>
        <TopNav />
        <MapContainer />
        </div>
      </StateProvider>
    </ApolloProvider>
  )
}

export default App;