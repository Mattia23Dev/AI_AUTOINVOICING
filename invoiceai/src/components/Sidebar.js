import React from 'react'
import './sidebar.css';
import logo from '../imgs/logo.png';

const Sidebar = ({setLoginOpen, setRegOpen}) => {
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
      <div className="navbar-right">
        <button onClick={() => setLoginOpen(true)}>Accedi</button>
        <button onClick={() => setRegOpen(true)}>Registrati</button>
      </div>
    </div>
  )
}

export default Sidebar