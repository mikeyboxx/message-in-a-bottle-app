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
