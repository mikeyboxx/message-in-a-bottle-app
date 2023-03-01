import * as React from 'react';
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

const drawerBleeding = 56;


const Root = styled('div')(({ theme }) => ({
  borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
  height: '100%',
  flex: 1,
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
            height: `calc(50% - ${drawerBleeding}px)`,
            overflow: 'visible',
            
          },
        }}
      />
      {/* <Box sx={{ textAlign: 'center', pt: 1 }}>
        <Button onClick={toggleDrawer(true)}>Open</Button>
      </Box> */}
      <SwipeableDrawer
      
        styles={{borderTopLeftRadius: 8,
          borderTopRightRadius: 8,}}
        // container={container}
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
        // classes={{bottom: 100}}
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
            
            // bottom: -100
          }}
        >
          <Puller />
          <Typography variant="h5" sx={{ p: 2, color: 'purple' }}>{notesInProximity.length} Note{notesInProximity.length > 1 ? 's' : ''} in Proximity <small style={{fontSize: '.7em'}}>(swipe to view)</small></Typography>
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
