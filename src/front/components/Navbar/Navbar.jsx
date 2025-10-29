import React, { useContext } from "react";
import { Link, useNavigate, useNavigate } from "react-router-dom";
import movieVerseLogo from "../../assets/img/MovieVerse.png";
import { Context } from "../../appContext";
import "./Navbar.css";


export const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link to="/" className="navbar-brand mb-0 h1">
                    React Boilerplate
                </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/peliculas" className="nav-link">Películas</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/registro" className="nav-link">Registrarse</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
