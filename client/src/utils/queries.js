import { gql } from '@apollo/client';

export const QUERY_NOTES_IN_BOUNDS = gql`
query notesInBounds($swLat: Float!, $swLng: Float!, $neLat: Float!, $neLng: Float!) {
  notesInBounds(swLat: $swLat, swLng: $swLng, neLat: $neLat, neLng: $neLng) {
    id
    noteText
    lat
    lng
  }
}
`;

