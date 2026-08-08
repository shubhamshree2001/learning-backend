import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios';

function App() {

  const [jokes, setJokes] = useState([]);

  // http://localhost:3000 this is added to proxy in vite config , so there is no repeatation of base url and
  // the proxy is aaded to the request url that means that it tells the the request is coming from this url only 
  // so adding proxy solves to problem of same origin
  // proxy does not only append the base url but also tells the react app that the request which is goin is goin from the 3000 port
  // even if the react app is running on different port
  useEffect(() => {
    axios.get('/api/jokes')
      .then((response) => {
        setJokes(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  
  return (
    <>
      <h1>Hello World</h1>
      <p> Jokes: {jokes.length}</p>

      {
        jokes.map((joke, index) => {

          return (
            <div key={joke.id}>
              <h2>{joke.joke}</h2>
            </div>
          )
        })
      }

    </>
  )
}

export default App


// CORS - Cross-Origin Resource Sharing
// Cors provide security to the application 
// origin needs to be same 
//whitlist the ip or domain 