import {useCallback, useState} from 'react';
import {BottomNavigation, BottomNavigationAction} from '@mui/material/';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import Badge from '@mui/material/Badge';

// import {Journals} from 'react-bootstrap-icons';

import { useStateContext } from '../../utils/GlobalState';
import Auth from '../../utils/auth';
import { UPDATE_MENU_ACTION } from '../../utils/actions';

const actionStyle = {
  color: 'purple'
};

export default function TopNavContainer() {
  const [{menuAction}, dispatch] = useStateContext();
  const [value, setValue] = useState(menuAction);

  const handleChange = useCallback((event, newValue) => {
    event.preventDefault();
    
    dispatch({
      type: UPDATE_MENU_ACTION,
      menuAction: newValue,
    });

    newValue === 'signOut' && Auth.logout();
    
    // highlight the selected icon
    ['location', 'favorites'].includes(newValue) && setValue(newValue);
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
          icon={<Badge 
                  // badgeContent={4} 
                  // color="secondary"
                  >
                    <FavoriteIcon />
               </Badge> }
          // icon={<Journals size={22} style={{fontWeight: 'bold', marginBottom: 3}}/>}
        />
           
        {/* </BottomNavigationAction> */}
        {/* <BottomNavigationAction
          sx={actionStyle}
          label="Favorites"
          value="favorites"
          icon={<FavoriteIcon />}
          // icon={<Journals size={22} style={{fontWeight: 'bold', marginBottom: 3}}/>}
        /> */}

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
    </>
  );
}
