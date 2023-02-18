const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Note {
    _id: ID
    noteText: String
    lat: Float
    lng: Float
  }

  type Query {
    notes: [Note]

    notesInBounds(
      swLat: Float!, 
      swLng: Float!, 
      neLat: Float!, 
      neLng: Float!): [Note]
  }

`;

module.exports = typeDefs;

