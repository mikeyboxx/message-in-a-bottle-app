const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Location {
    lat: Float
    lng: Float
  }
  type Note {
    position: Location
    distance: Float
  }

  type Query {
    notesInBounds(swLat: Float!, swLng: Float!, neLat: Float!, neLng: Float!): [Note]
  }

`;

module.exports = typeDefs;

