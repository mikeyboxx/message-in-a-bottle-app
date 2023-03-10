import { useReducer } from 'react';
import {
  UPDATE_GPS_POSITION,
  UPDATE_ERRORS,
  UPDATE_USER_ACTION,
  UPDATE_NOTES_IN_PROXIMITY
} from './actions';

// The reducer is a function that accepts the current state and an action. It returns a new state based on that action.
export const reducer = (state, action) => {
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

    case UPDATE_USER_ACTION:
      return {
        ...state,
        userAction: action.userAction,
        prevUserAction: action.prevUserAction || state.userAction
      };

    case UPDATE_NOTES_IN_PROXIMITY:
      return {
        ...state,
        notesInProximity: action.notesInProximity,
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
