import React, { useEffect, useState } from "react";
import "./Watched.css";

export const Watched = () => {
  const [watched, setWatched] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadWatched() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moviesviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setWatched(data["movie views"] || []);
        } else {
          console.warn("⚠️ No se pudieron cargar las películas vistas del backend");
        }
      } catch (err) {
        console.error("💥 Error al cargar películas vistas:", err);
      }
    }

    if (token) loadWatched();
  }, []);

  return (
    <div className="watched-container">
      <h1>🎬 Películas Vistas</h1>
      {watched.length === 0 ? (
        <p>Aún no has visto ninguna película.</p>
      ) : (
        <div className="watched-grid">
          {watched.map((movie) => (
            <div key={movie.id} className="watched-card">
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "https://via.placeholder.com/300x450?text=Sin+imagen"
                }
                alt={movie.title}
              />
              <h4>{movie.title || "Sin título"}</h4>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
