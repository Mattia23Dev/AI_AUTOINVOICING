import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home';
import AiInvoicing from './pages/autoinvoice/AiInvoicing';
import Sidebar from './components/Sidebar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import OAuth from './pages/home/OAuth';

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(false);

  return (
    <Router>
      <GoogleOAuthProvider clientId="604280477054-aj050p5dmg77u4joij3gj9stdsuci4pa.apps.googleusercontent.com">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
      <div>
        {loginOpen && (
          <div className='popup-shadow'>
            <Login setLoginOpen={setLoginOpen} setRegOpen={setRegOpen} />
          </div>  
        )} 
        {regOpen && (
          <div className='popup-shadow'>
            <Register setLoginOpen={setLoginOpen} setRegOpen={setRegOpen} />
          </div>  
        )}
        <Sidebar setLoginOpen={setLoginOpen} setRegOpen={setRegOpen} />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/ai-invoice" element={<AiInvoicing />} />
          <Route path="/oauth" element={<OAuth />} />
        </Routes>
      </div>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
