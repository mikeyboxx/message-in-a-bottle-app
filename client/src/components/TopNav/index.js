import {useCallback, useState} from 'react';
import {BottomNavigation, BottomNavigationAction} from '@mui/material/';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import SignIn from '../../components/SignIn';
import SignUp from '../../components/SignUp';
import Auth from '../../utils/auth';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_USER_ACTION, UPDATE_CENTER_MAP } from '../../utils/actions';

const actionStyle = {
  color: 'purple'
};

export default function TopNav() {
  const [{userAction}, dispatch] = useStateContext();
  const [value, setValue] = useState(userAction);

  const handleChange = useCallback((event, newValue) => {
    if (newValue === 'centerMap')
      dispatch({
        type: UPDATE_CENTER_MAP,
        centerMap: true,
      });
    else
      dispatch({
        type: UPDATE_USER_ACTION,
        userAction: newValue,
      });

    newValue === 'signOut' && Auth.logout();
    
    // do not select the icon
    !['signIn', 'signOut'].includes(newValue) && setValue(newValue);
  },[dispatch]);

  return (
    <>
      <BottomNavigation 
        value={value} 
        onChange={handleChange}
        showLabels={true}
      >
        <BottomNavigationAction
          sx={actionStyle}
          label="Location"
          value="centerMap"
          icon={<LocationOnIcon />}
        />
        <BottomNavigationAction
          sx={actionStyle}
          label="Create"
          value="create"
          icon={<StickyNote2OutlinedIcon />}
        />
        <BottomNavigationAction
          sx={actionStyle}
          label="Favorites"
          value="favorites"
          icon={<FavoriteIcon />}
        />

        {!Auth.loggedIn() ? 
          <BottomNavigationAction
            sx={actionStyle}
            label="Sign In" 
            value="signIn" 
            icon={<LoginOutlinedIcon />} 
          /> :
          <BottomNavigationAction
            sx={actionStyle}
            label="Sign Out" 
            value="signOut" 
            icon={<LogoutOutlinedIcon />} 
          />}
      </BottomNavigation>

      <SignIn />
      <SignUp />
    </>
  );
}
