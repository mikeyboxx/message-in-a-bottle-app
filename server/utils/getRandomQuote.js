const axios = require('axios');

const getRandomQuote = () =>{
  return new Promise(async (resolve, reject)=> {
      await axios.get(`https://zenquotes.io/api/random`)
        .then(response => {
          if (response.statusText !== 'OK')
            reject({err: response.statusText});
          else 
            resolve(response.data[0]);
        })
        .catch(err => {
            return reject(err)
        });
  })
};

module.exports = getRandomQuote;