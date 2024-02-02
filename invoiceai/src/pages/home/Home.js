import React, {useContext, useEffect, useState} from 'react'
import './home.css'
import logo from '../../imgs/logo.png';
import fatture from '../../imgs/home-img.png'
import axios from 'axios'
import useWebSocket from '../../context/useWebSocket';
import { UserContext } from '../../context/userContext';

const Home = () => {
  const socket = useWebSocket(process.env.REACT_APP_API); 
  const [state, setState] = useContext(UserContext);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Connesso al server WebSocket');
      });

    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

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

  const handleFileUpload = async () => {
    try {
      if (!selectedFile) {
        console.error('Nessun file selezionato.');
        return;
      }
      console.log(selectedFile);

      if (socket) {
        socket.emit('upload_pdf', selectedFile, (response) => {
          console.log('Risposta dal server:', response);
        });
      }
    } catch (error) {
      console.error('Errore durante l\'upload del file:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    //handleFileUpload(file);
  };

  return (
    <>
    {state && state.token && state.user ? (
      <div className='home-container'>
        <button onClick={handleAuthClick}>Autorizza</button>
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Carica PDF</button>
      </div>
    ) : (
    <div className='home-container'>
        <img alt='logo auto fatture ai' src={logo} />
        <h1>Auto Fatture Ai è il tuo braccio destro</h1>
        <img alt='fatture immagine' src={fatture} />
    </div>      
    )}
    </>

  )
}

export default Home