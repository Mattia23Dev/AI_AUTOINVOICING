import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';

const OAuth = () => {
  const [state, setState] = useContext(UserContext);  
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentUrl = window.location.href;
    const code = searchParams.get('code');
    console.log(code);

    const getToken = async () => {
        await axios.get(`/auth/callback?code=${code}&userId=${state.user._id}&url=${currentUrl}`)
        .then((response) => {
            console.log(response);
            saveToken(response.data.tokenObj);
        })
        .catch((error) => {
            console.error('Errore durante il processo di autenticazione:', error);
        })
        .finally(() => {
            console.log('ok')
        });
    }

    getToken();
  }, []);

  const saveToken = async (tokenObj) => {
    try {
        const response = await axios.post("/save-token", { ...tokenObj, userId: state.user._id });
        console.log(response)
        toast.success('Autorizzazione andata a buon fine!');
        navigate('/');
        setIsLoading(false);
    } catch (error) {
        console.error(error);
    }
  }

  return (
    <div>
      {isLoading && (
        <p>Loading..</p>
      )}
    </div>
  );
};

export default OAuth;