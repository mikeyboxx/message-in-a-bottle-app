import * as React from 'react';
import {BottomNavigation, BottomNavigationAction} from '@mui/material/';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export default function BottomNav({handler}) {
  const [value, setValue] = React.useState('location');

  const handleChange = (event, newValue) => {
    setValue(newValue);
    handler(newValue);
  };

  return (
    <BottomNavigation 
      value={value} 
      onChange={handleChange}
      showLabels={true}
    >
      <BottomNavigationAction
        sx={{color: 'purple'}}
        label="Location"
        value="location"
        icon={<LocationOnIcon />}
      />
      <BottomNavigationAction
        sx={{color: 'purple'}}
        label="Create"
        value="create"
        icon={<StickyNote2OutlinedIcon />}
      />
      <BottomNavigationAction
        sx={{color: 'purple'}}
        label="Favorites"
        value="favorites"
        icon={<FavoriteIcon />}
      />
      <BottomNavigationAction
        sx={{color: 'purple'}}
        label="Login" 
        value="login" 
        icon={<LoginOutlinedIcon />} 
      />
    </BottomNavigation>
  );
}
