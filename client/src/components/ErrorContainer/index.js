import { useEffect } from 'react';
import Alert from '@mui/material/Alert';
import { useStateContext } from '../../utils/GlobalState';
// import { DELETE_ERRORS } from '../../utils/actions';



export default function ErrorProvider() {
  const [{errors, navId, timer}, ] = useStateContext();

  if (errors.length > 0) {
    console.log('yo');
    console.log(navId, timer);
    navigator.geolocation.clearWatch(navId);
    clearInterval(timer);
  };

  // useEffect(()=>{
  //   if (errors.length > 0) 
  //     dispatch({
  //       type: DELETE_ERRORS,
  //     });
  // },[errors, dispatch]);

  return (
    <>
      {errors.length > 0 && 
        errors.map((error, idx) =>{ 
          return (
          <Alert variant="filled" severity="error" key={idx}>
            {error.name}: {error.message}
          </Alert>)})}
    </>
  )
}