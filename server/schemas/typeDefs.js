const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Note {
    _id: ID
    noteText: String
    lat: Float
    lng: Float
    distance: Float
    inProximity: Boolean
  }

  type Query {
    notes: [Note]

    notesInBounds(
      currLat: Float!,
      currLng: Float!,
      swLat: Float!, 
      swLng: Float!, 
      neLat: Float!, 
      neLng: Float!): [Note]
  }

`;

module.exports = typeDefs;

