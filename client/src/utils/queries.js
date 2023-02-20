import { gql } from '@apollo/client';

export const QUERY_NOTES_IN_BOUNDS = gql`
query NotesInBounds($swLat: Float!, $swLng: Float!, $neLat: Float!, $neLng: Float!, $lat: Float, $lng: Float) {
  notesInBounds(swLat: $swLat, swLng: $swLng, neLat: $neLat, neLng: $neLng, lat: $lat, lng: $lng) {
    note {
      id
      noteText
      noteAuthor
      noteOwner
      lat
      lng
    }
  }
}
`;

