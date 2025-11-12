import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Favorites.css";
import { Loading } from "../components/Loading"; //spinner importado


export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // spinner nuevo estado de carga
  const [searchTerm, setSearchTerm] = useState("");

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

  // 🔹 Cargar lista de favoritos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadFavorites() {
      try {
        setIsLoading(true); // Activa el spinner
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
          setFavorites([]);
        }
      } catch (err) {
        console.error("💥 Error al cargar favoritos:", err);
      } finally {
        setIsLoading(false); //  Apaga el spinner
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

  // 🔎 Filtrar favoritos por título
  const filteredFavorites = favorites.filter((fav) =>
    fav.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Muestra el spinner mientras carga
  if (isLoading) {
    return (
      <div className="loading-container">
        <Loading message="Cargando tus favoritos..." />
      </div>
    );
  }
  return (
    <div className="favorites-container">
      <h1 className="title">
        MIS<span>FAVORITOS</span>
      </h1>
{/* 🔍 Buscador igual que en películas */}
<div className="favorites-search text-center mb-4 d-flex justify-content-center">
  <input
    type="text"
    className="favorites-input"
    placeholder="Buscar por título..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button className="favorites-btn">
    <i className="bi bi-search">🔍 </i>
  </button>
</div>



      {favorites.length === 0 ? (
        <p>No tienes películas en favoritos aún.</p>
      ) : (
        <div className="favorites-grid">
          {filteredFavorites.map((fav) => (
            <div
              key={fav.id}
              className="favorite-card clickable"
              onClick={() => navigate(`/movie/${fav.tmdb_id}`)}
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
