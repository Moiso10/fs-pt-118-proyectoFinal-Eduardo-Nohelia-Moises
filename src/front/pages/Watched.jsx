import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Watched.css";

export const Watched = () => {
  const [watched, setWatched] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadWatched() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moviesviews/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const moviesviews = data.moviesviews;
          const detailed = await Promise.all(
            moviesviews.map(async (mov) => {
              try {
                const res = await fetch(
                  `https://api.themoviedb.org/3/movie/${mov.tmdb_id}?language=es-ES`,
                  {
                    headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
                  }
                );
                console.log(mov)
                const movie = await res.json();
                return { ...movie, moviesViewId: mov.id, tmdb_id: mov.tmdb_id };
              } catch {
                return mov;
              }
            })
          );
          setWatched(detailed);
        }
      } catch (err) {
        console.error("💥 Error al cargar películas vistas:", err);
      }
    }

    if (token) loadWatched();
  }, []);

  // 👉 Función para eliminar
  async function handleRemove(e, id) {
    e.preventDefault(); // evita que se dispare el Link
    e.stopPropagation(); // evita que el clic burbujee
    const token = localStorage.getItem("token");
    try {
      console.log("🗑️ Eliminando registro con id:", id);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moviesviews/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setWatched((prev) => prev.filter((m) => m.moviesViewId !== id));
      } else {
        console.warn("❌ No se pudo eliminar la película:", data.error);
      }
    } catch (err) {
      console.error("💥 Error al eliminar:", err);
    }
  }

  return (
    <div className="watched-container">
      <h1>🎬 Películas Vistas</h1>
      {watched.length === 0 ? (
        <p>Aún no has visto ninguna película.</p>
      ) : (
        <div className="watched-grid">
          {watched.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.tmdb_id}`}
              className="watched-card"
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=Sin+imagen"
                }
                alt={movie.title}
              />
              <h4>{movie.id}-{movie.title || "Sin título"}</h4>

              <button
                className="btn-remove"
                onClick={(e) => handleRemove(e, movie.moviesViewId)}
              >
                ❌ Eliminar
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
