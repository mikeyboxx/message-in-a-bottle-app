const { AuthenticationError } = require('apollo-server-express');
const { Note, User } = require('../models');
const { signToken } = require('../utils/auth');

const PROXIMITY_THRESHOLD = 50;

const resolvers = {
  Query: {
    notes: async () => Note.find(),

    notesInBounds: async (parent, {swLat, swLng, neLat, neLng, lat, lng}) => {
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
          inProximity: distance && (distance < PROXIMITY_THRESHOLD)
        } 
      });

      return notes;
    },

    users: async () => User.find().populate(['createdNotes', 'ownedNotes']),
  },

  Mutation: {
    addUser: async (parent, args) => {
      console.log('addUser');
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    
    // user must be logged in order to change name, email, or password
    updateUser: async (parent, args, context) => {
      try {
        if (context.user) {
          const user = await User.findByIdAndUpdate(context.user._id, args, { new: true });
          return user;
        }
      } catch (err) {
        console.log(err);
      }

      throw new AuthenticationError('Not logged in');
    },
    
    login: async (parent, { userName, password }) => {
      const user = await User.findOne({ userName });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Password is incorrect');
      }

      const token = signToken(user);

      return { token, user };
    },

    addNote: async (parent, args, context) => {
      if (context.user) {
        const note = await Note.create({
          ...args,
          noteAuthor: context.user.userName,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { createdNotes: note._id, ownedNotes: note._id } },
        );

        return note;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  }
};

module.exports = resolvers;
