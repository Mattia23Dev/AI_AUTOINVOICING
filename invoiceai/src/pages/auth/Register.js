import React, { useContext, useState } from 'react';
import axios from 'axios'
import './auth.css'
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { UserContext } from '../../context/userContext';
import google from '../../imgs/google.png';

const Register = ({setLoginOpen, setRegOpen}) => {
  const [state, setState] = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    company: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false, // Aggiungi uno stato per l'accettazione dei termini
  });

  const { name, email, phoneNumber, company, password, confirmPassword, termsAccepted } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Se il campo è una casella di controllo (checkbox), gestisci il suo stato separatamente
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async(e) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('Devi accettare i termini e le condizioni per procedere.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Le password non corrispondono');
      return;
    }
    
    try {
      const response = await axios.post(`/auth/register`, formData);
      console.log(response.data);

      setState(response.data.data);
      localStorage.setItem("auth", JSON.stringify(response.data.data));
      setRegOpen(false);
      setLoginOpen(false);
      toast.success("Benvenuto!");

      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        company: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false,
      });
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
    <div className='register-container'>
      <h4>Sign up</h4>
      <div className='form-container'>
        <form>
          <div className='form-group'>
            <label htmlFor='name'>Nome</label>
            <input type='text' id='name' name='name' value={name} onChange={handleChange} placeholder='Inserisci il tuo nome' required />
          </div>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input type='email' id='email' name='email' value={email} onChange={handleChange} placeholder='Inserisci la tua email' required />
          </div>
          <div className='form-group'>
            <label htmlFor='phoneNumber'>Numero di telefono</label>
            <input type='text' id='phoneNumber' name='phoneNumber' value={phoneNumber} onChange={handleChange} placeholder='Inserisci il tuo numero di telefono' required />
          </div>
          <div className='form-group'>
            <label htmlFor='company'>Nome Azienda</label>
            <input type='text' id='company' name='company' value={company} onChange={handleChange} placeholder='Inserisci il nome della tua azienda' required />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input type='password' id='password' name='password' value={password} onChange={handleChange} placeholder='Inserisci la tua password' required />
          </div>
          <div className='form-group'>
            <label htmlFor='confirmPassword'>Conferma Password</label>
            <input type='password' id='confirmPassword' name='confirmPassword' value={confirmPassword} onChange={handleChange} placeholder='Conferma la tua password' required />
          </div>
          <div className='form-group'>
            <label className='label-check'>
              <input className='checkbox' type='checkbox' name='termsAccepted' checked={termsAccepted} onChange={handleChange} />
              Accetto i termini e le condizioni
            </label>
          </div>
        </form>
        <div className='btn-container'>
          <button onClick={handleRegister} className='button-reg'>Registrati</button>
          <p>Already got an account - <span onClick={() => {setLoginOpen(true); setRegOpen(false)}}>sign in</span></p>
          <GoogleLogin
            clientId="604280477054-aj050p5dmg77u4joij3gj9stdsuci4pa.apps.googleusercontent.com"
            buttonText="Registrati con Google"
            render={renderProps => (
              <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="custom-google-button"><img src={google} alt='google logo' />Registrati con Google</button>
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

export default Register;
