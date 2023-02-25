import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

window.addEventListener('resize', () =>{ 
  console.log('before');
  console.log(window.screen.height, window.innerHeight, window.clientHeight);
  console.log(window.screen.width , window.innerWidth, window.clientHeight);
  
  setTimeout(()=>{
    console.log('after');
    console.log(window.screen.height, window.innerHeight, window.clientHeight);
    console.log(window.screen.width , window.innerWidth, window.clientHeight);
  

  },0); 
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


