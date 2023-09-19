import {useCallback, useState} from "react";
import { useMutation } from '@apollo/client';

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import {Journals} from 'react-bootstrap-icons';

import Auth from '../../utils/auth';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_MENU_ACTION } from '../../utils/actions';
import { ADD_NOTE } from '../../utils/mutations';

export default function CreateNote() {
  const [{menuAction, position}, dispatch] = useStateContext();
  const [createError, setCreateError] = useState(null);
  const [addNote] = useMutation(ADD_NOTE);

  const handleClose = useCallback(async event => {
    setCreateError(null);
    dispatch({
      type: UPDATE_MENU_ACTION,
      menuAction: 'location'
    });
  },[dispatch]);


  const handleSubmit = useCallback(async event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    
    try {
      setCreateError(null);
      
      const bearing = data.get('bearing') === 'on' ? Math.floor(Math.random() * 360) + 1 : null; 

      await addNote({
        variables: {
          noteText: data.get('noteText'),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          bearing
      }});

      dispatch({
        type: UPDATE_MENU_ACTION,
        menuAction: 'location'
      });

    } catch (e) {
      setCreateError(e);
    }
  },[position, addNote, dispatch]);


  return (
    <>
     {menuAction === 'create' &&
      <Dialog 
        open={true}
        onClose={handleClose} 
      >
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              paddingBottom: 2,
              paddingTop: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <Journals />
            </Avatar>
            
            <Typography component="h1" variant="h5">
              Create Note
            </Typography>

            <Typography component="span" sx={{color: 'red'}}>
                {!Auth.loggedIn() ? '* You need to sign in first!' : createError ? '*' + createError?.message : ""}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <TextField
                    variant="outlined"
                    multiline
                    rows={11}
                    required
                    fullWidth
                    id="noteText"
                    name="noteText"
                    label="Note Text"
                  />

              <FormControlLabel 
                control={<Checkbox size="small" name="bearing"/>} 
                label="Make the Note Fly" />

              <Button
                sx={{marginTop:2}}
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={!Auth.loggedIn() ? true : false}
              >
                Create Note
              </Button>
            </Box>

          </Box>
        </Container>
      </Dialog>}
    </>
  );
}
