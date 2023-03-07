import {useCallback, useState} from 'react';
import {BottomNavigation, BottomNavigationAction} from '@mui/material/';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Auth from '../../utils/auth';

const actionStyle = {
  color: 'purple'
};

export default function BottomNav({userAction, userActionHandler}) {
  const [value, setValue] = useState(userAction);

  const handleChange = useCallback((event, newValue) => {
    userActionHandler(newValue);

    // if Sign Out is selected logout user
    newValue === 'signOut' && Auth.logout();
    
    // do not select the icon
    !['signIn', 'signOut'].includes(newValue) && setValue(newValue);
  },[userActionHandler]);

  return (
    <BottomNavigation 
      value={value} 
      onChange={handleChange}
      showLabels={true}
    >
      <BottomNavigationAction
        sx={actionStyle}
        label="Location"
        value="location"
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
  );
}
