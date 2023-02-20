const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type GeoItem {
    _id: ID
    lat: Float
    lng: Float
  }
  type Note {
    _id: ID
    geoItemId: ID
    noteText: String
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

