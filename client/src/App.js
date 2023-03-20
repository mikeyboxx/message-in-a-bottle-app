import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink,} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { StateProvider } from './utils/GlobalState';

import TopNavContainer from './components/TopNavContainer';
import MapContainer from './components/MapContainer';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

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
  // console.log('App');
  
  return (
    <ApolloProvider client={client}>
      <StateProvider>
        <TopNavContainer />
        <MapContainer /> 
          
        {/* Modals */}
        <SignIn />
        <SignUp />

      </StateProvider>
    </ApolloProvider>
  )
}

export default App;