import * as React from 'react';
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
import {Box, Typography} from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import {Journals} from 'react-bootstrap-icons';

const drawerBleeding = 56;


const Root = styled('div')(({ theme }) => ({
  
  // borderTopLeftRadius: 20,
  // borderTopRightRadius: 20,
  // height: '100%',
  // flex: 1,
  backgroundColor:
    theme.palette.mode === 'light' ? grey[100] : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
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

export default function DrawerContainer(props) {
  const { notesInProximity } = props;
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = React.useCallback((newOpen) => () => {
    setOpen(newOpen);
  },[]);

  return (
    <Root>
      <CssBaseline />
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            // height: `calc(50% - ${drawerBleeding}px)`,
            maxHeight: `calc(50% - ${drawerBleeding}px)`,
            overflow: 'visible',
            // display: 'flex',
            
            
          },
        }}
      />
      
      <SwipeableDrawer
        anchor="bottom"
        open={open}
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
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
        >
          <Puller />

          {notesInProximity.length > 0 &&
            <div style={{display: 'flex', position: 'relative', width: '100%', paddingTop: 15, paddingBottom: 15}}> 
              <Typography 
                variant="h7" 
                sx={{ 
                  color: 'purple',
                  ml: 2,
                  mt: .5,
                }}
              >
                  {notesInProximity.length}
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'purple',
                  position: 'absolute',
                  ml: 1,
                  // mt: .5
                }}
              >
                  <Journals size={30} />  
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'purple',
                  ml: 3,
                  // mt: .5
                }}
              >
                 Pickup Notes 
              </Typography>
            </div>}

        </StyledBox>
        <StyledBox
          sx={{
            px: 2,
            pb: 2,
            height: '100%',
            overflow: 'auto',
          }}
        >
          {/* <Skeleton variant="rectangular" height="100%"> */}
          <ul style={{listStyleType: 'none', margin: 0, padding: 15}}>
              {notesInProximity
                .map(({note: {noteText, noteAuthor, createdTs}, distance}, idx) => { 
                  const dt = new Date(createdTs);
                  const dtString = dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
                  return ( 
                    <li key={idx}>
                        {noteText}<br/><br/> 
                        By: {noteAuthor} -- {dtString}<br/> 
                        Distance: {distance.toFixed(1)} meters <hr/> 
                    </li>)
                })}
            </ul>
            {/* </Skeleton> */}
        </StyledBox>
      </SwipeableDrawer>
    </Root>
  );
}
