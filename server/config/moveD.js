const db = require('./connection');
const movementDaemon = require('../utils/movementDaemon');

db.once('open', async () => {
  movementDaemon();
});
