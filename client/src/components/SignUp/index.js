import {useCallback, useState} from "react";
import { useMutation } from '@apollo/client';

import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Dialog from '@mui/material/Dialog';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import Auth from '../../utils/auth';
import { useStateContext } from '../../utils/GlobalState';
import { UPDATE_MENU_ACTION } from '../../utils/actions';
import { ADD_USER } from '../../utils/mutations';

export default function SignUp() {
  const [{menuAction}, dispatch] = useStateContext();
  const [loginError, setLoginError] = useState(null);
  const [addUser] = useMutation(ADD_USER);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword( show => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleClose = useCallback(async event => {
    dispatch({
      type: UPDATE_MENU_ACTION,
      menuAction: null
    });
  },[dispatch]);

  const handleSignInClick = useCallback(async event => {
    event.preventDefault();
    dispatch({
      type: UPDATE_MENU_ACTION,
      menuAction: 'signIn',
    });
  },[dispatch]);

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
        type: UPDATE_MENU_ACTION,
        menuAction: null
      });

    } catch (e) {
      setLoginError(e);
    }
  },[addUser, dispatch]);


  return (
    <>
     {menuAction === 'signUp' &&
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
                  <FormControl>
                    <InputLabel variant="outlined" sx={{background: 'white', pr:1, pl: 1}}>Password *</InputLabel>
                    <OutlinedInput
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      fullWidth
                      notched
                      autoComplete="current-password"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
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
      </Dialog>}
    </>
  );
}