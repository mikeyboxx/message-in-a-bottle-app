const db = require('./connection');
const { Note, User } = require('../models');

db.once('open', async () => {
  
  await Note.deleteMany();

  console.log('notes seeded');
  
  await User.deleteMany();
  
  await User.create({
    firstName: 'Pamela',
    lastName: 'Washington',
    email: 'pamela@testmail.com',
    userName: 'pamWash',
    password: 'password12345'
  });

  await User.create({
    firstName: 'Elijah',
    lastName: 'Holt',
    email: 'eholt@testmail.com',
    userName: 'eliHolt',
    password: 'password12345'
  });
  
  await User.create({
    firstName: 'System',
    lastName: 'Generated',
    email: 'autoGen@autoGen.com',
    userName: 'autoGen',
    password: 'password12345'
  });

  console.log('users seeded');

  process.exit();
});
