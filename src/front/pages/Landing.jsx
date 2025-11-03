import { Link } from "react-router-dom";
import "./Landing.css";
import { useEffect, useState } from "react";
import { Carrousel } from "../components/Carrousel/Carrousel";

export const Landing = () => {
  const [bgImage, setBgImage] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        const resp = await fetch(base + "/api/movieverse");
        const data = await resp.json();
        if (resp.ok && Array.isArray(data.reviews_movie_verse)) {
          setReviews(data.reviews_movie_verse);
        }
      } catch (err) {
        console.error("Error cargando reseñas MovieVerse:", err);
      }
    };
    loadReviews();
  }, []);

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
        <section className="landing-hero py-5">
          <div className="container text-center">
            <div className="row justify-content-center align-items-center">
              <div className="col-md-8 col-lg-7">
                <h1 className="display-4 mb-3">Bienvenido a MovieVerse</h1>
                <p className="lead mb-4">
                  Descubre, guarda y disfruta de tus películas favoritas.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Link to="/peliculas" className="btn btn-primary btn-lg">Ver Películas</Link>
                  <Link to="/registro" className="btn btn-outline-primary btn-lg">Registrarse</Link>
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

            {/* Reseñas de MovieVerse */}
            <div className="row mt-4">
              <div className="col-12 text-center mb-3">
                <h4 className="mb-0">Reseñas de MovieVerse</h4>
                <p className="text-muted">Opiniones reales de nuestra comunidad</p>
              </div>

              {reviews.length === 0 ? (
                <div className="col-12 text-center">
                  <p className="text-muted">Aún no hay reseñas disponibles.</p>
                </div>
              ) : (
                reviews.map((rev) => {
                  const alias = (rev?.user?.email || "Usuario").split("@")[0];
                  const stars = Math.max(0, Math.min(5, parseInt(rev?.valoration ?? 0)));
                  return (
                    <div key={rev.id} className="col-12 col-md-6 col-lg-4 mb-4">
                      <div className="card bg-dark text-light border-secondary h-100">
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-secondary">@{alias}</span>
                            <div aria-label={`Valoración ${stars} de 5`}>
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={(i < stars) ? "fa-solid fa-star text-warning" : "fa-regular fa-star text-secondary"}
                                  title={(i < stars) ? "Estrella" : "Sin estrella"}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <h6 className="card-title mb-2">{rev.title}</h6>
                          <textarea
                            className="form-control bg-dark text-light border-secondary flex-grow-1"
                            value={rev.body}
                            readOnly
                            rows={4}
                            style={{ resize: "none", overflowY: "auto" }}
                            aria-label="Comentario del usuario"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
