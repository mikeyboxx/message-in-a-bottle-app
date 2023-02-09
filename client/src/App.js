import {useLoadScript} from '@react-google-maps/api';
// import MapContainer from './components/MapContainer';


function App() {
  // console.log('App');
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry']
  });

  return (
      <div>
        {(!isLoaded) && 'Loading...'}

        {loadError && 'Error Loading Google Maps!'}

        {/* {isLoaded && <MapContainer/>} */}
      </div>
  );
}

export default App;
