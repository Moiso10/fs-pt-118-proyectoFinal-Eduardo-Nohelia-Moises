import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../appContext";
import "./Navbar.css";

export const Navbar = () => {
  const { store, dispatch } = useContext(Context);
  const isLogged = store.auth;
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "user_logged_out" });
    navigate("/"); // 👈 redirige a la landing al cerrar sesion
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold text-danger fs-3">
          Movie<span className="text-light">Verse</span>
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
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link to="/" className="nav-link">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link to="/inicio" className="nav-link">Películas</Link>
            </li>

            {isLogged ? (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">Perfil</Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light ms-2"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Registrarse</Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="btn btn-danger ms-2">
                    Iniciar sesión
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
