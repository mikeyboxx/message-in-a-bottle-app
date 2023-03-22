import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation login($userName: String!, $password: String!) {
    login(userName: $userName, password: $password) {
      token
      user {
        id
        firstName
        lastName
      }
    }
  }
`;


export const ADD_USER = gql`
  mutation addUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $userName: String!
    $password: String!
  ) {
      addUser(
        firstName: $firstName
        lastName: $lastName
        email: $email
        userName: $userName
        password: $password
      ) {
        token
        user {
          id
          firstName
          lastName
        }
      }
    }
`;
export const ADD_NOTE = gql`
  mutation addNote(
    $noteText: String!, 
    $lat: Float!, 
    $lng: Float!, 
    $bearing: Int
  ) {
      addNote(
        noteText: $noteText, 
        lat: $lat, 
        lng: $lng, 
        bearing: $bearing
      ) {
          id
          noteText
          noteAuthor
          noteOwner
          lat
          lng
          bearing
          createdTs
          updatedTs
        }
    }
`;
