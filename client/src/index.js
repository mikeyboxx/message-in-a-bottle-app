import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

window.addEventListener('resize', () =>{ 
  // console.log(window.screen.height, window.innerHeight);
  // console.log(window.screen.width , window.innerWidth);
  
  setTimeout(()=>{
  //   console.log(window.screen.height, window.innerHeight);
  //   console.log(window.screen.width , window.innerWidth);
  // }, 0);

  },0); 
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


