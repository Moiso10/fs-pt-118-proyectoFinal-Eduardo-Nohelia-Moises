import React, { useEffect, useState } from "react";
import "./Favorites.css";

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadFavorites() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setFavorites(data.favorites || []);
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
        setFavorites(favorites.filter((f) => f.id !== favId));
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
            <div key={fav.id} className="favorite-card">
              <img
                src={
                  fav.poster_path
                    ? `https://image.tmdb.org/t/p/w500${fav.poster_path}`
                    : "https://via.placeholder.com/300x450?text=Sin+imagen"
                }
                alt={fav.title}
              />
              <h4>{fav.title || "Sin título"}</h4>
              <button className="btn-remove" onClick={() => handleRemove(fav.id)}>
                ❌ Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
