import { useReducer } from 'react';
import {getDistanceFromLatLonInMeters} from './trigonometry';
import {
  UPDATE_GPS_POSITION,
  UPDATE_MENU_ACTION,
  UPDATE_NOTES_IN_BOUNDS,
} from './actions';

const PROXIMITY_THRESHOLD = 20;

export const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_GPS_POSITION:
      return {
        ...state,
        position: action.position,
      }

    case UPDATE_MENU_ACTION:
      return {
        ...state,
        menuAction: action.menuAction,
      };

    case UPDATE_NOTES_IN_BOUNDS: 
      const arr = action.notesInBounds.map(({note}) => {
        const distance =  
          getDistanceFromLatLonInMeters(
            state.position.coords.latitude, 
            state.position.coords.longitude, 
            note.lat, 
            note.lng);

        return {
          note,
          distance,
          inProximity: distance < PROXIMITY_THRESHOLD
        }
      });

      return {
        ...state,
        notesInBounds: arr,
        notesInProximity: arr.filter(note => note.inProximity)
      };

      
    default:
      return state;
  }
};

export function useStateReducer(initialState) {
  return useReducer(reducer, initialState);
}
