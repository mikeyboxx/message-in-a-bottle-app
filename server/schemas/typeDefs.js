const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID
    firstName: String
    lastName: String
    email: String
    createdTs: String
    updatedTs: String
  }

  type Auth {
    token: ID
    user: User
  }

  type Note {
    id: ID
    noteText: String
    noteAuthor: String
    noteOwner: String
    lat: Float
    lng: Float
    createdTs: String
    updatedTs: String
  }

  type NoteInBounds {
    note: Note
    distance: Float
    inProximity: Boolean
  }

  type Query {
    notes: [Note]

    notesInBounds(
      lat: Float,
      lng: Float,
      swLat: Float!, 
      swLng: Float!, 
      neLat: Float!, 
      neLng: Float!): [NoteInBounds]

    users: [User]
  }

  type Mutation {
    addUser(firstName: String!, lastName: String!, email: String!, userName: String!, password: String!): Auth
    updateUser(firstName: String, lastName: String, email: String, password: String): User
    login(email: String!, password: String!): Auth
  }

`;

module.exports = typeDefs;

