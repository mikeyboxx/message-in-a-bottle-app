import Alert from '@mui/material/Alert';
import { useStateContext } from '../../utils/GlobalState';


export default function ErrorProvider() {
  const [{errors}, ] = useStateContext();

  return (
    <>
      {errors.length > 0 && 
        errors.map((error, idx) => 
          <Alert variant="filled" severity="error" key={idx}>
            Error loading Google Maps! <br/>
            {error.message}
          </Alert>)}
    </>
  )
}