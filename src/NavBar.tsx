import { Component } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import ConnectButton from "./ConnectButton";
import logo from './logo.svg';
import faceIcon from './face.svg';

export default function NavBar() {
  //const navigate = useNavigate();

  return (
    <nav className="navbar navbar-light bg-light static-top">
      <div className="container">
        <div>
          <img src={logo} className="logo me-3" alt="logo" />
          <Link to='/' className="navbar-brand">NotesExchange</Link>
        </div>
        <p className='navbar-text my-0'>
          <Link to='/profile'>
            <img className="img-fluid rounded-circle me-2" style={{ height: "3vh" }} src={faceIcon} alt="Profile" />
          </Link>
          <ConnectButton></ConnectButton>
        </p>
      </div>
    </nav>
  );
}