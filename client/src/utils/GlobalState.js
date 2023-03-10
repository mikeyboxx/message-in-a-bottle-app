import { createContext, useContext } from "react";
import { useStateReducer } from './reducers'

const StateContext = createContext();
const { Provider } = StateContext;

const StateProvider = ({ value = {}, ...props }) => {
  const [state, dispatch] = useStateReducer({
    userAction: 'center-map',
    prevUserAction: null,
    position: null,
    notesInProximity: [],
    // navId: null,
    errors: [],
    notes: [],

    // products: [],
    // cart: [],
    // cartOpen: false,
    // categories: [],
    // currentCategory: '',
  });

  return <Provider value={[state, dispatch]} {...props} />;
};

const useStateContext = () => {
  return useContext(StateContext);
};

export { StateProvider, useStateContext };
