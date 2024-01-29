import React, { useContext, useState } from 'react';
import axios from 'axios'
import './auth.css'
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { UserContext } from '../../context/userContext';
import google from '../../imgs/google.png';

const Login = ({setLoginOpen, setRegOpen}) => {
  const [state, setState] = useContext(UserContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async(e) => {
    e.preventDefault();
    if (!email) {
      alert('Inserisci la mail');
      return;
    }

    if (!password) {
      alert('Inserisci la password');
      return;
    }
    
    try {
      const response = await axios.post(`/auth/login`, formData);
      console.log(response.data);

      setState(response.data.data);
      localStorage.setItem("auth", JSON.stringify(response.data.data));
      setRegOpen(false);
      setLoginOpen(false);
      toast.success("Bentornato!");

    } catch (error) {
      console.error('Errore durante la registrazione:', error);
    }
    
  };

  const responseSuccessGoogle = (response) => {
    console.log(response);
  
    axios({
      method: "POST",
      url: '/auth/google-login',
      data: {tokenId: response.tokenId}
    }).then(response => {
      setState(response.data.data);
      localStorage.setItem("auth", JSON.stringify(response.data.data));
      setRegOpen(false);
      setLoginOpen(false);
      toast.success("Benvenuto!");
    });
  }

  const responseFailGoogle = (response) => {
    console.log(response);
    toast.error('Si è verificato un errore con Google')
  }

  return (
    <div className='login-container'>
      <h4>Sign in</h4>
      <div className='form-container'>
        <form>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input type='email' id='email' name='email' value={email} onChange={handleChange} placeholder='Inserisci la tua email' required />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input type='password' id='password' name='password' value={password} onChange={handleChange} placeholder='Inserisci la tua password' required />
          </div>
        </form>
        <div className='btn-container btn-log-container'>
          <button onClick={handleRegister} className='button-reg'>Accedi</button>
          <p>Non hai ancora un account? - <span onClick={() => {setLoginOpen(false); setRegOpen(true)}}>sign un</span></p>
          <GoogleLogin
            clientId="604280477054-aj050p5dmg77u4joij3gj9stdsuci4pa.apps.googleusercontent.com"
            buttonText="Registrati con Google"
            render={renderProps => (
              <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="custom-google-button"><img src={google} alt='google logo' />Accedi con Google</button>
            )}
            onSuccess={responseSuccessGoogle}
            onFailure={responseFailGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
