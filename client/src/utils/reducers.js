import { useReducer } from 'react';
import {getDistanceFromLatLonInMeters} from './trigonometry';
import {
  UPDATE_GPS_POSITION,
  UPDATE_ERRORS,
  UPDATE_USER_ACTION,
  UPDATE_NOTES_IN_BOUNDS,
  UPDATE_MAP_BOUNDS,
  UPDATE_CENTER_MAP,
  DELETE_ERRORS,
  UPDATE_TIMER
} from './actions';

const PROXIMITY_THRESHOLD = 200;

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer = (state, action) => {
  console.log(action);
  switch (action.type) {
    // Returns a copy of state with an update products array. We use the action.products property and spread it's contents into the new array.
    case UPDATE_GPS_POSITION:
      return {
        ...state,
        position: action.position,
      }

    case UPDATE_ERRORS:
      return {
        ...state,
        errors: [...state.errors, action.error],
      };

    case DELETE_ERRORS:
      return {
        ...state,
        errors: [],
      };

    case UPDATE_USER_ACTION:
      return {
        ...state,
        userAction: action.userAction,
        prevUserAction: action.prevUserAction || state.userAction
      };

    case UPDATE_NOTES_IN_BOUNDS: 
      const arr = action.notesInBounds.map(({note}) => {
        const distance =  getDistanceFromLatLonInMeters(
          state.position.coords.latitude, state.position.coords.longitude, note.lat, note.lng);
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

    case UPDATE_MAP_BOUNDS:
      return {
        ...state,
        centerMap: action.centerMap !== null ? action.centerMap : state.centerMap,
        mapBounds: action.mapBounds,
      };

    case UPDATE_CENTER_MAP:
      return {
        ...state,
        centerMap: action.centerMap,
      };

    case UPDATE_TIMER:
      return {
        ...state,
        timer: action.timer,
      };

    // Return the state as is in the event that the `action.type` passed to our reducer was not accounted for by the developers
    // This saves us from a crash.
    default:
      return state;
  }
};

export function useStateReducer(initialState) {
  return useReducer(reducer, initialState);
}
