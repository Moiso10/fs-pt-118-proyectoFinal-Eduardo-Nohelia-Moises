import { Link } from "react-router-dom";
import "./Landing.css";
import { useState } from "react";
import { Carrousel } from "../components/Carrousel/Carrousel";

export const Landing = () => {
  const [bgImage, setBgImage] = useState(null);

  return (
    <div className="landing">
      {/* Fondo difuminado sincronizado con el carrusel */}
      {bgImage && (
        <div
          className="landing-bg"
          style={{ backgroundImage: `url(${bgImage})` }}
          aria-hidden
        />
      )}

      <div className="landing-content">
        <section className="landing-hero bg-light py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h1 className="display-4 mb-3">Bienvenido a MovieVerse</h1>
                <p className="lead text-muted mb-4">
                  Descubre, guarda y disfruta de tus películas favoritas.
                </p>
                <div className="d-flex gap-2">
                  <Link to="/peliculas" className="btn btn-primary btn-lg">Ver Películas</Link>
                  <Link to="/registro" className="btn btn-outline-primary btn-lg">Registrarse</Link>
                  <button type="button" className="btn btn-link ms-2" onClick={() => document.documentElement.classList.toggle('theme-dark')}>
                    Cambiar tema
                  </button>
                </div>
              </div>
              <div className="col-md-5 text-center mt-4 mt-md-0">
                <div className="login-card p-4 border rounded bg-white shadow-sm">
                  <h5 className="mb-2">¿Ya tienes cuenta?</h5>
                  <Link to="/login" className="btn btn-dark">Iniciar Sesión</Link>
                  <Link to="/profile" className="btn btn-primary">Ver Perfil (demo)</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Carrousel de fotografías */}
        <section className="py-4">
          <div className="container">
            <Carrousel onSlideChange={(src) => setBgImage(src)} />
          </div>
        </section>

        <section className="landing-features py-5">
          <div className="container">
            <div className="row text-center">
              <div className="col-md-4 mb-4">
                <i className="fa-solid fa-film fa-2x mb-3 text-primary"></i>
                <h5>Catálogo amplio</h5>
                <p className="text-muted">Explora cientos de películas por género y popularidad.</p>
              </div>
              <div className="col-md-4 mb-4">
                <i className="fa-solid fa-heart fa-2x mb-3 text-danger"></i>
                <h5>Favoritos</h5>
                <p className="text-muted">Guarda tus títulos preferidos y míralos cuando quieras.</p>
              </div>
              <div className="col-md-4 mb-4">
                <i className="fa-solid fa-user-shield fa-2x mb-3 text-success"></i>
                <h5>Cuenta segura</h5>
                <p className="text-muted">Regístrate y gestiona tu perfil de forma sencilla.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
