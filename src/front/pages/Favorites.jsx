import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  async function fetchMovieDetails(tmdb_id) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdb_id}`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
        },
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("💥 Error al cargar película TMDB:", err);
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadFavorites() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          const movies = await Promise.all(
            data.favorites.map(async (fav) => {
              const movie = await fetchMovieDetails(fav.tmdb_id);
              return movie
                ? { ...movie, id: fav.id, tmdb_id: fav.tmdb_id }
                : fav;
            })
          );
          setFavorites(movies);
        } else {
          console.warn("⚠️ No se pudieron cargar los favoritos del backend");
        }
      } catch (err) {
        console.error("💥 Error al cargar favoritos:", err);
      }
    }

    if (token) loadFavorites();
  }, []);

  const handleRemove = async (favId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/${favId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFavorites((prevFavorites) => prevFavorites.filter((f) => f.id !== favId));
      }
    } catch (err) {
      console.error("💥 Error al eliminar favorito:", err);
    }
  };

  return (
    <div className="favorites-container">
      <h1>💖 Mis Favoritos</h1>
      {favorites.length === 0 ? (
        <p>No tienes películas en favoritos aún.</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="favorite-card"
              onClick={() => navigate(`/movie/${fav.tmdb_id}`)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <img
                src={
                  fav.poster_path
                    ? `https://image.tmdb.org/t/p/w500${fav.poster_path}`
                    : "https://via.placeholder.com/300x450?text=Sin+imagen"
                }
                alt={fav.title}
              />
              <h4>{fav.title || "Sin título"}</h4>

              {/* ❌ Botón para eliminar (sin activar el click general) */}
              <button
                className="btn-remove"
                onClick={(e) => {
                  e.stopPropagation(); // 🧠 evita que el click del contenedor navegue
                  handleRemove(fav.id);
                }}
              >
                ❌ Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
