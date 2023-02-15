import { gql } from '@apollo/client';

export const QUERY_NOTES_IN_BOUNDS = gql`
query notesInBounds($currLat: Float!, $currLng: Float!, $swLat: Float!, $swLng: Float!, $neLat: Float!, $neLng: Float!) {
  notesInBounds(currLat: $currLat, currLng: $currLng, swLat: $swLat, swLng: $swLng, neLat: $neLat, neLng: $neLng) {
    id
    position {
      lat
      lng
    }
    distance
    inProximity
  }
}
`;

export const QUERY_NOTES_IN_PROXIMITY = gql`
notesInProximity($currLat: Float!, $currLng: Float!) {
  notesInProximity(currLat: $currLat, currLng: $currLng) {
    id
    position {
      lat
      lng
    }
  }
}
`;
