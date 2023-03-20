import {useCallback, useState} from "react";
import { useMutation } from '@apollo/client';

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Dialog from '@mui/material/Dialog';

import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_USER_ACTION } from '../../utils/actions';
import { ADD_USER } from '../../utils/mutations';
import Auth from '../../utils/auth';

export default function SignUp() {
  const [{userAction, prevUserAction}, dispatch] = useStateContext();
  const [loginError, setLoginError] = useState(null);
  const [addUser] = useMutation(ADD_USER);

  const handleClose = useCallback(async event => {
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: prevUserAction
    });
  },[dispatch, prevUserAction]);

  const handleSignInClick = useCallback(async event => {
    event.preventDefault();
    dispatch({
      type: UPDATE_USER_ACTION,
      userAction: 'signIn',
      prevUserAction 
    });
  },[dispatch, prevUserAction]);

  const handleSubmit = useCallback(async event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    
    try {
      setLoginError(null);
      
      const response = await addUser({
        variables: { 
          firstName: data.get('firstName'), 
          lastName: data.get('lastName'), 
          email: data.get('email'), 
          userName: data.get('userName'), 
          password: data.get('password') 
      }});

      Auth.login(response.data.addUser.token);

      dispatch({
        type: UPDATE_USER_ACTION,
        userAction: prevUserAction
      });

    } catch (e) {
      setLoginError(e);
    }
  },[addUser, dispatch, prevUserAction]);


  return (
    <Dialog 
      open={userAction === 'signUp'}
      onClose={handleClose}
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
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
            Sign up
          </Typography>
          <Typography component="span" sx={{color: 'red'}}>
              {loginError ? '*' + loginError?.message : ""}
            </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="lname"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="userName"
                  label="User Name"
                  id="userName"
                  autoComplete="userName"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
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
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item sx={{marginTop:2}}>
                <Link href="#" variant="body2" onClick={handleSignInClick}>
                  Already have an account? 
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Dialog>
  );
}
