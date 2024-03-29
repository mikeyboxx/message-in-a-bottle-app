import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import Auth from '../../utils/auth';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_MENU_ACTION } from '../../utils/actions';
import { LOGIN } from '../../utils/mutations';

export default function SignIn() {
  const [{menuAction}, dispatch] = useStateContext();
  const [login] = useMutation(LOGIN);
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = useCallback(async event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    
    try {
      setLoginError(null);
      
      const response = await login({
        variables: { 
          userName: data.get('userName'), 
          password: data.get('password') 
      }});

      Auth.login(response.data.login.token);

      dispatch({
        type: UPDATE_MENU_ACTION,
        menuAction: null
      });

    } catch (e) {
      setLoginError(e);
    }
  },[login, dispatch]);

  const handleClose = useCallback(async event => {
    event.preventDefault();
    dispatch({
      type: UPDATE_MENU_ACTION,
      menuAction: null
    });
  },[dispatch]);

  const handleSignUpClick = useCallback(async event => {
    event.preventDefault();
    dispatch({
      type: UPDATE_MENU_ACTION,
      menuAction: 'signUp',
    });
  },[dispatch]);


  return (
    <>
     {menuAction === 'signIn' &&
      <Dialog 
        open={true}
        onClose={handleClose}
      >
        <Container component="main" maxWidth="xs" >
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
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
              Sign in
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Typography component="span" sx={{color: 'red'}}>
                {loginError ? '*' + loginError?.message : ""}
              </Typography>

              <TextField
                margin="normal"
                required
                fullWidth
                id="userName"
                label="User Name"
                name="userName"
                autoComplete="userName"
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>

              <Grid container>
                <Grid item >
                  <Link href="#"   variant="body2" onClick={handleSignUpClick}>
                    Don't have an account? 
                  </Link>
                </Grid>
              </Grid>
            </Box>

          </Box>
        </Container>
      </Dialog>}
    </>
  );
}
