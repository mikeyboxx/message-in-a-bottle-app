const { AuthenticationError } = require('apollo-server-express');
const { Note, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    notes: async () => Note.find(),

    notesInBounds: async (parent, {swLat, swLng, neLat, neLng, lat, lng}) => {
      // console.log('notesInBounds');
      // console.log(lat, lng, swLat, swLng, neLat, neLng);
      const data = await Note.find({
        $and: [
          {lat: {$gt: swLat }},
          {lng: {$gt: swLng }},
          {lat: {$lt: neLat }},
          {lng: {$lt: neLng }},
        ]
      });
      
      const notes = data.map(note=> {
        const distance = (lat && lng) && note.getDistance(lat, lng);
        return {
          note,
          distance,
          inProximity: distance && (distance < 10)
        } 
      });

      return notes;
    },

    users: async () => User.find(),
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    
    // user must be logged in order to change name, email, or password
    updateUser: async (parent, args, context) => {
      try {
        if (context.user) {
          console.log(context.user, args);
          const user = await User.findByIdAndUpdate(context.user._id, args, { new: true });
          // console.log(user);
          return user;
        }
      } catch (err) {
        console.log(err);
      }

      throw new AuthenticationError('Not logged in');
    },
    
    login: async (parent, { userName, password }, context) => {
      if (context.user) {
        throw new AuthenticationError('Already logged in');
      }

      const user = await User.findOne({ userName });
      

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    
  }
};

module.exports = resolvers;
