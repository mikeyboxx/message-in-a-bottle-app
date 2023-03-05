const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');

const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const seedDaemon = require('./utils/seedDaemon');
const movementDaemon = require('./utils/movementDaemon');

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: false,
  // context: authMiddleware,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
// app.use('/images', express.static(path.join(__dirname, '../client/images')));

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // If it's not https already, redirect the same url on https. header will contain the actual protocol string (eg, 'http' or 'https').
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`);
    else
      next();
  });
  app.use(express.static(path.join(__dirname, '../client/build')));
};

app.get('/', (req, res) => {
  console.log('get /');
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, '0.0.0.0', () => {  
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`)
      // seedDaemon();
      movementDaemon();
    });
  })
};
  
// Call the async function to start the server
startApolloServer(typeDefs, resolvers);