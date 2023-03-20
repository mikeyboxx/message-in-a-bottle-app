import { useReducer } from 'react';
import {
  UPDATE_GPS_POSITION,
  UPDATE_USER_ACTION,
  UPDATE_NOTES_IN_BOUNDS,
} from './actions';


export const reducer = (state, action) => {
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
        prevUserAction: state.userAction === 'location' ? Math.floor(Math.random() * 1000).toString() : state.userAction
      };

    case UPDATE_NOTES_IN_BOUNDS: 
      return {
        ...state,
        notesInBounds: action.notesInBounds,
      };
    
    default:
      return state;
  }
};

export function useStateReducer(initialState) {
  return useReducer(reducer, initialState);
}
