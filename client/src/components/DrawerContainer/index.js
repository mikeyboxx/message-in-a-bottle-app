import { useState, useCallback } from 'react';

import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

import { Box, Typography, Card } from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import BottomNavigation from '@mui/material/BottomNavigation';

import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Journals } from 'react-bootstrap-icons';

import { useStateContext } from '../../utils/GlobalState';

const actionStyle = {
  color: 'purple',
  alignItems: 'start',
  padding: 0,
  margin: 0
};

const drawerBleeding = 58;

const Root = styled('div')(({ theme }) => ({
  backgroundColor:
  theme.palette.mode === 'light' ? grey[100] : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === 'light' ? grey[300] : grey[900],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

export default function DrawerContainer() {
  const [{ notesInProximity }] = useStateContext();
  const [open, setOpen] = useState(false);
  const toggleDrawer = useCallback(newOpen => () => setOpen(newOpen), []);
  const [value, setValue] = useState(null);


  return (
    <>
      {notesInProximity?.length > 0 && 
      <Root onClick={toggleDrawer(!open)}>
        <Global
          styles={{
            '.MuiDrawer-root > .MuiPaper-root': {
              maxHeight: `calc(80% - ${drawerBleeding}px)`,
              overflow: 'visible',
              padding: 15,
              display: 'flex'
            },
          }}
        />
        
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClick={toggleDrawer(!open)}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          swipeAreaWidth={drawerBleeding}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <StyledBox
            sx={{
              position: 'absolute',
              top: -drawerBleeding,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              visibility: 'visible',
              right: 0,
              left: 0,
            }}
          >
            <Puller />

            <div style={{
              display: 'flex', 
              width: '100%', 
              padding: 15,
              }}
            > 
              <Typography variant="h7" 
                sx={{ 
                  color: 'purple',
                  ml: 2,
                  mt: .5,
                }}
              >
                
              </Typography>

              <Typography variant="h5" 
                sx={{ 
                  color: 'purple',
                  position: 'absolute',
                  ml: 1,
                }}
              >
                <Journals size={30} />  
              </Typography>

              <Typography variant="h6" 
                sx={{ 
                  color: 'red',
                  ml: 5,
                }}
              >
                Pickup <span style={{
                  marginLeft: 5,
                  marginRight: 5,
                  
                }}>{notesInProximity.length}</span> Notes 
              </Typography> 

            </div>
          </StyledBox>

          <StyledBox sx={{  overflow: 'auto', mb: 2}}>
              {notesInProximity
                .map(({note: {noteText, noteAuthor, createdTs}, distance}, idx) => { 
                  const dt = new Date(createdTs);
                  const dtString = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
                  return ( 
                      <Card key={idx} sx={{p: 2, m:2, elevation: 15}} raised>

                          <Typography color="text.secondary">
                            {noteText}
                          </Typography>

                          <br/>

                          <Typography color="text.secondary">
                            Created by: {noteAuthor}
                          </Typography>

                          <Typography color="text.secondary">
                            On: {dtString}
                          </Typography>

                          <Typography color="text.secondary">
                            Distance: {distance.toFixed(2)} meters
                          </Typography>

                          <BottomNavigation 
                            value={value} 
                            onChange={(event, newValue)=>{console.log(newValue); setValue(newValue);}}
                            showLabels={true}
                            sx={{}}
                          >
                            <BottomNavigationAction
                              sx={actionStyle}
                              label="Save"
                              value="save"
                              icon={<FavoriteIcon fontSize="small"/>}
                            />
                            <BottomNavigationAction
                              sx={actionStyle}
                              label="Destroy"
                              value="destroy"
                              icon={<DeleteForeverIcon fontSize="small"/>}
                            />
                          </BottomNavigation>
                         
                      </Card>
                    )
              })}
          </StyledBox>
        </SwipeableDrawer>
      </Root>}
     </>
  );
}
