import {useState, useCallback, useEffect} from 'react';
import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import {Box, Typography, Card} from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import {Journals} from 'react-bootstrap-icons';

import { useStateContext } from '../../utils/GlobalState';

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
  const [{notesInBounds}, ] = useStateContext();
  const [open, setOpen] = useState(false);
  const [notesInProximity, setNotesInProximity] = useState([]);
  const toggleDrawer = useCallback(newOpen => () => setOpen(newOpen), []);

  useEffect(() => 
    setNotesInProximity(notesInBounds.filter(note => note.inProximity))
  , [notesInBounds])

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
                        <pre style={{ whiteSpace: 'pre-wrap'}}>
                          <Typography color="text.secondary">
                            {noteText}
                          </Typography>
                        </pre>

                          <Typography sx={{ml: 2, mt: 1}} variant="body2">
                            By: {noteAuthor} -- {dtString}
                          </Typography>

                          <Typography sx={{ml: 2}} variant="body2">
                            Distance: {distance.toFixed(1)} meters  
                          </Typography> 
                      </Card>
                    )
              })}
          </StyledBox>
        </SwipeableDrawer>
      </Root>}
     </>
  );
}
