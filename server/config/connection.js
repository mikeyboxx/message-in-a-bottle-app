const mongoose = require('mongoose');

mongoose.connect(
  // process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/message-in-a-bottle',
  process.env.MONGODB_URI || 'mongodb+srv://DB_Admin:Injustice2@cluster0.21lhvfj.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = mongoose.connection;