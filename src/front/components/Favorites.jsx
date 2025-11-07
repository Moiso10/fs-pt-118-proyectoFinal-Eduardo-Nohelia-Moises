import React, { useEffect, useState } from "react";
import "./Favorites.css";

export const Favorites = ({ tmdbId, title, mode = "list" }) => {
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔹 Cargar favoritos o verificar uno solo
  useEffect(() => {
    if (!token) return;

    const loadFavorites = async () => {
      try {
        if (mode === "list") {
          // 🧾 Cargar todos los favoritos del usuario
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (data.success && data.favorites) {
            // 🔹 Cargar detalles desde TMDb
            const detailed = await Promise.all(
              data.favorites.map(async (fav) => {
                try {
                  const res = await fetch(
                    `https://api.themoviedb.org/3/movie/${fav.tmdb_id}?language=es-ES`,
                    {
                      headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
                    }
                  );
                  const movie = await res.json();
                  return { ...fav, ...movie };
                } catch {
                  return fav;
                }
              })
            );
            setFavorites(detailed);
          }
        }

        if (mode === "button" && tmdbId) {
          // 🔹 Verificar si una pelicula ya es favorita
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/favorites/check/${tmdbId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (data.success) {
            setIsFavorite(data.is_favorite);
            setFavoriteId(data.favorite_id);
          }
        }
      } catch (err) {
        console.error("💥 Error al cargar favoritos:", err);
      }
    };

    loadFavorites();
  }, [mode, tmdbId, token]);

  // 🔹 Añadir o eliminar favorito
  const handleToggleFavorite = async () => {
    if (!token) {
      alert("Debes iniciar sesión para gestionar favoritos.");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite && favoriteId) {
        // 🗑️ Eliminar favorito
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/favorites/${favoriteId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (res.ok && data.success) {
          setIsFavorite(false);
          setFavoriteId(null);
          setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
        }
      } else {
        // 💖 Agregar favorito
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tmdb_id: tmdbId }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setIsFavorite(true);
          setFavoriteId(data.data.id);
          setFavorites((prev) => [...prev, data.data]);
        }
      }
    } catch (err) {
      console.error("💥 Error al alternar favorito:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Render modo botón (individual)
  if (mode === "button") {
    return (
      <button
        className={`btn-fav ${isFavorite ? "active" : ""} ${loading ? "loading" : ""}`}
        onClick={handleToggleFavorite}
        disabled={loading}
      >
        {isFavorite ? "💖 Quitar favoritos" : "❤️ Agregar a favoritos"}
      </button>
    );
  }

  // 🔹 Render modo lista (vista de favoritos)
  return (
    <div className="favorites-container">
      <h1>💖 Mis Favoritos</h1>
      {favorites.length === 0 ? (
        <p>No tienes películas en favoritos aún.</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="favorite-card">
              <img
                src={
                  fav.poster_path
                    ? `https://image.tmdb.org/t/p/w500${fav.poster_path}`
                    : "https://via.placeholder.com/300x450?text=Sin+imagen"
                }
                alt={fav.title || "Película sin título"}
              />
              <h4>{fav.title || "Sin título"}</h4>
              <Favorites tmdbId={fav.tmdb_id} mode="button" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
