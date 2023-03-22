import {useCallback, useState} from "react";
import { useMutation } from '@apollo/client';


import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Dialog from '@mui/material/Dialog';
import {Journals} from 'react-bootstrap-icons';


import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_USER_ACTION } from '../../utils/actions';
import { ADD_NOTE } from '../../utils/mutations';

export default function CreateNote() {
  // const [{userAction, position: {coords: {latitude: lat, longitude: lng}}}, dispatch] = useStateContext();
  const [{userAction, position}, dispatch] = useStateContext();
  const [createError, setCreateError] = useState(null);
  const [addNote] = useMutation(ADD_NOTE);

  const handleClose = useCallback(async event => {
    setCreateError(null);
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: 'location'
    });
  },[dispatch]);


  const handleSubmit = useCallback(async event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    
    try {
      setCreateError(null);
      
      const note = await addNote({
        variables: {
          noteText: data.get('noteText'),
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          bearing: null
      }});

      console.log(note);

      dispatch({
        type: UPDATE_USER_ACTION,
        userAction: 'location'
      });

    } catch (e) {
      setCreateError(e);
    }
  },[position, addNote, dispatch]);


  return (
    <Dialog 
      open={userAction === 'create'}
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
              {createError ? '*' + createError?.message : ""}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  sx={{height: 300, width: 400}}
                  name="noteText"
                  variant="outlined"
                  multiline
                  // maxRows={40}
                  minRows={10}
                  required
                  fullWidth
                  id="noteText"
                  label="Note Text"
                />
              </Grid>
            </Grid>

            <Button
              sx={{marginTop:2}}
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Create Note
            </Button>
          </Box>

        </Box>
      </Container>
    </Dialog>
  );
}
