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

import { LOGIN } from '../../utils/mutations';
import Auth from '../../utils/auth';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_USER_ACTION } from '../../utils/actions';

export default function SignIn() {
  // console.log('SignIn');
  const [{userAction, prevUserAction}, dispatch] = useStateContext();
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
        type: UPDATE_USER_ACTION,
        userAction: prevUserAction
      });

    } catch (e) {
      setLoginError(e);
    }
  },[login, dispatch, prevUserAction]);

  const handleClose = useCallback(async event => {
    event.preventDefault();
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: prevUserAction
    });
  },[dispatch, prevUserAction]);

  const handleSignUpClick = useCallback(async event => {
    event.preventDefault();
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: 'signUp',
      prevUserAction 
    });
  },[dispatch, prevUserAction]);


  return (
    <Dialog 
      open={userAction === 'signIn'}
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
    </Dialog>
  );
}
