import { useReducer } from 'react';
import {getDistanceFromLatLonInMeters} from './trigonometry';
import {
  UPDATE_GPS_POSITION,
  UPDATE_USER_ACTION,
  UPDATE_NOTES_IN_BOUNDS,
} from './actions';

const PROXIMITY_THRESHOLD = 200;

export const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    case UPDATE_GPS_POSITION:
      return {
        ...state,
        position: action.position,
      }

    case UPDATE_USER_ACTION:
      return {
        ...state,
        userAction: action.userAction,
        prevUserAction: action.prevUserAction || state.userAction
      };

    case UPDATE_NOTES_IN_BOUNDS: 
      const arr = action.notesInBounds.map(({note}) => {
        const distance =  getDistanceFromLatLonInMeters(
          state.position.coords.latitude, 
          state.position.coords.longitude, 
          note.lat, 
          note.lng
        );
        return {
          note,
          distance,
          inProximity: distance < PROXIMITY_THRESHOLD
        }
      });

      return {
        ...state,
        notesInBounds: arr,
      };
    

    default:
      return state;
  }
};

export function useStateReducer(initialState) {
  return useReducer(reducer, initialState);
}
