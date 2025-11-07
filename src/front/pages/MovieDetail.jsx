import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./MovieDetail.css";
import { Favorites } from "../components/Favorites";

export const MovieDetail = () => {
  const { id } = useParams();
  const { store } = useGlobalReducer();
  const isLogged = store.auth || !!localStorage.getItem("token");
  const token = localStorage.getItem("token");

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", valoration: 0 });
  const [favoriteAdded, setFavoriteAdded] = useState(false);
  const [providers, setProviders] = useState([]); // plataformas
  const [watched, setWatched] = useState(false);
  const [watchedId, setWatchedId] = useState(null);
  // 🔹 Revisar si ya esta marcada como favorita
  useEffect(() => {
    const saved = localStorage.getItem(`favorite-${id}`);
    if (saved === "true") setFavoriteAdded(true);
  }, [id]);

  // 🔹 Cargar detalles de pelicula desde TMDB
  useEffect(() => {
    const loadMovie = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY
          }&language=es-ES`
        );
        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Error al cargar película:", err);
      }
    };
    loadMovie();
  }, [id]);

  // 🔹 Cargar reseñas desde backend
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${id}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error del servidor");

        const safeReviews = Array.isArray(data.reviews)
          ? data.reviews.map((r) => ({
            ...r,
            valoration: parseInt(r.valoration) || 0,
            title: r.title || "Sin título",
            body: r.body || "Sin contenido",
          }))
          : [];

        setReviews(safeReviews);
      } catch (error) {
        console.warn("⚠️ No se pudieron cargar las reseñas:", error.message);
        setReviews([]);
      }
    };
    loadReviews();
  }, [id]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${import.meta.env.VITE_TMDB_API_KEY
          }`
        );
        const data = await res.json();

        // El país ES se usa para España (puedes cambiar a "US" o el tuyo)
        const es = data.results?.ES;
        if (es && es.flatrate) {
          setProviders(es.flatrate);
        } else {
          setProviders([]);
        }
      } catch (err) {
        console.error("Error al cargar plataformas:", err);
      }
    };

    loadProviders();
  }, [id]);


  // 🔹 Enviar reseña
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    const cleanValoration = parseInt(form.valoration);
    if (isNaN(cleanValoration) || cleanValoration < 1 || cleanValoration > 5) {
      alert("La valoración debe ser un número entre 1 y 5.");
      return;
    }

    const body = {
      tmdb_id: id,
      title: form.title.trim() || "Sin título",
      body: form.body.trim() || "Sin contenido",
      valoration: cleanValoration,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.warn("⚠️ Error backend:", data.error || "Respuesta inválida");
        alert("No se pudo guardar la reseña. Error del servidor.");
        return;
      }

      const review = data.reviews || body;
      review.valoration = parseInt(review.valoration) || 0;
      setReviews([...reviews, review]);
      setForm({ title: "", body: "", valoration: 0 });
      setShowForm(false);
      alert("🎬 Reseña guardada con éxito.");
    } catch (error) {
      console.error("💥 Error al enviar reseña:", error);
      alert("Error de conexión. Intenta más tarde.");
    }
  };


  const handleWatched = async (tmdb_id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      if (!watched) {
        // 👉 AÑADIR película vista
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moviesviews/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tmdb_id }),
        });
        const data = await res.json();

        // 🔹 Adaptación: tu backend devuelve "movies views"
        const movieData = data["movies views"];

        if (res.ok && data.success && movieData) {
          setWatched(true);
          setWatchedId(movieData.id); // guarda el id autoincremental
        } else {
          console.warn("⚠️ Error al marcar como vista:", data.message || data.error);
        }
      } else {
        // 👉 ELIMINAR película vista por id autoincremental
        if (!watchedId) {
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moviesviews/${watchedId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setWatched(false);
          setWatchedId(null);
        } else {
          console.warn("⚠️ Error al desmarcar:", data.message || data.error);
        }
      }
    } catch (err) {
      console.error("💥 Error en handleWatched:", err);
    }
  };


  // 🔹 Verificar si esta película ya está en favoritos o vista
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/movie/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setFavoriteAdded(!!data.favorite);
          setWatched(!!data.watched);
          if (data.watched && data.watched.id) {
            setWatchedId(data.watched.id);
          } else {
            setWatchedId(null);
          }
        }
      } catch (err) {
        console.error("💥 Error al cargar estado de película:", err);
      }
    };

    loadStatus();
  }, [id]);


  if (!movie) {
    return (
      <div className="movie-detail-loading">
        <p>Cargando detalles de la película...</p>
      </div>
    );
  }

  return (
    <div
      className="movie-detail-container"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
      }}
    >
      <div className="movie-detail-overlay">
        <div className="movie-detail-card">
          <img
            className="movie-detail-poster"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />

          <div className="movie-detail-info">
            <h1>{movie.title}</h1>
            <p className="movie-detail-overview">{movie.overview}</p>
            <p><strong>Año:</strong> {movie.release_date?.split("-")[0]}</p>
            <p><strong>Géneros:</strong> {movie.genres?.map((g) => g.name).join(", ")}</p>
            <h3>Plataformas disponibles:</h3>
            <div className="providers" >
              {providers.length > 0 ? (
                providers.map((p) => (
                  <a
                    key={p.provider_id}
                    href={`https://www.themoviedb.org/movie/${id}-watch`} // Enlace TMDb que redirige a la plataforma real
                    target="_blank"
                    rel="noopener noreferrer"
                    className="provider"
                    title={`Ver en ${p.provider_name}`}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                      alt={p.provider_name}
                    />
                  </a>
                ))
              ) : (
                <p>No disponible en plataformas conocidas.</p>
              )}
            </div>

            {isLogged ? (
              <div className="actions">
                <button
                  className="btn-red"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? "❌ Cancelar reseña" : "✍️ Añadir reseña"}
                </button>

                <Favorites tmdbId={id} title={movie.title} mode="button" />
                <button
                  className="btn-red"
                  onClick={() => handleWatched(id)}
                >
                  {watched ? "❌ Desmarcar como vista" : "👁️ Marcar como vista"}
                </button>

              </div>
            ) : (
              <p className="login-warning">
                🔒 Registrate o inicia sesión para dejar una reseña o agregar favoritos.
              </p>
            )}


            <div className="movie-reviews">
              <h3>Reseñas</h3>
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <strong>{r.title || "Sin título"}</strong>
                      <span className="review-stars">
                        {"⭐".repeat(r.valoration || 0)}
                      </span>
                    </div>
                    <p>{r.body}</p>
                    {r.user && <small>👤 {r.user.email || "Usuario desconocido"}</small>}
                  </div>
                ))
              ) : (
                <p className="no-reviews">No hay reseñas todavía.</p>
              )}

              {isLogged && showForm && (
                <form onSubmit={handleSubmit} className="review-form">
                  <input
                    type="text"
                    placeholder="Título de la reseña"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Escribe tu reseña..."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                  />
                  <label>Valoración (1 a 5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={form.valoration}
                    onChange={(e) =>
                      setForm({ ...form, valoration: e.target.value })
                    }
                    required
                  />
                  <button type="submit" className="btn-save-review">
                    💾 Guardar reseña
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
