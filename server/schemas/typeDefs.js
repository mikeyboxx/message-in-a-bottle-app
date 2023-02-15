const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Location {
    lat: Float
    lng: Float
  }

  type Note {
    id: Int
    position: Location
    distance: Float
    inProximity: Boolean
  }

  type Query {
    notesInBounds(
      currLat: Float!,
      currLng: Float!,
      swLat: Float!, 
      swLng: Float!, 
      neLat: Float!, 
      neLng: Float!): [Note]
      
    notesInProximity(
      currLat: Float!,
      currLng: Float!): [Note]
  }

`;

module.exports = typeDefs;

