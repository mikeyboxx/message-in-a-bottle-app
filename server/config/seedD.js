const db = require('./connection');
const seedDaemon = require('../utils/seedDaemon');

db.once('open', async () => {
  seedDaemon();
});