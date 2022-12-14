import { Component } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import ConnectButton from "./ConnectButton";
import logo from './logo.svg';

export default function NavBar() {
  //const navigate = useNavigate();

    return (
      <nav className="navbar navbar-light bg-light static-top">
        <div className="container">
          <img src={logo} className="logo" alt="logo" />
          <Link to='/' className="navbar-brand">NotesExchange</Link>
          <p className='navbar-text my-0'>
            <ConnectButton></ConnectButton>
          </p>
        </div>
      </nav>
    );
}