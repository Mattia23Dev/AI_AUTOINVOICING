import React from 'react'
import './home.css'
import logo from '../../imgs/logo.png';
import fatture from '../../imgs/home-img.png'
import axios from 'axios'

const Home = () => {
  const handleAuthClick = async () => {
    try {
      const response = await axios.get("/auth/authorize");
      console.log(response);
      const authorizationUrl = response.data;
      window.location.href = authorizationUrl;
    } catch (error) {
      console.error("Errore durante la generazione dell'URL di autorizzazione:", error);
    }
  };
  return (
    <div className='home-container'>
        <img alt='logo auto fatture ai' src={logo} />
        <h1>Auto Fatture Ai è il tuo braccio destro</h1>
        <img alt='fatture immagine' src={fatture} />
        <button onClick={handleAuthClick}>Autorizza</button>
    </div>
  )
}

export default Home