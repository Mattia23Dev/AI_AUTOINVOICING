import React, { useContext } from 'react'
import './sidebar.css';
import logo from '../imgs/logo.png';
import { UserContext } from '../context/userContext';

const Sidebar = ({setLoginOpen, setRegOpen}) => {
  const [state, setState] = useContext(UserContext);
  return (
    <div className='navbar'>
       <div className="navbar-left">
        <img src={logo} alt="logo auto fatture ai" />
      </div>
      <div className="navbar-center">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li className="dropdown">
            <a href="#">Menu &#9662;</a>
            <ul className="dropdown-content">
              <li><a href="#">Item 1</a></li>
              <li><a href="#">Item 2</a></li>
              <li><a href="#">Item 3</a></li>
            </ul>
          </li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      {state && state.token && state.user ? (
      <div className="navbar-right">
        <p>{state.user.name}</p>
        <button onClick={() => {localStorage.removeItem("auth"); setState()}}>Logout</button>
      </div>
      ) : (
      <div className="navbar-right">
        <button onClick={() => setLoginOpen(true)}>Accedi</button>
        <button onClick={() => setRegOpen(true)}>Registrati</button>
      </div>        
      )}

    </div>
  )
}

export default Sidebar