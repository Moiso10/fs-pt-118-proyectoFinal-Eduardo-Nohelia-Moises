import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../appContext";
import { getPopularMovies, searchMovies } from "../services/tmdb";
import "./MainView.css";

export const MainView = () => {
  const { store } = useContext(Context);
  const isLogged = store.auth || !!localStorage.getItem("token");

  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");

  // 🔹 Cargar películas populares
  useEffect(() => {
    async function loadMovies() {
      const data = await getPopularMovies();
      setMovies(data);
      console.log("🎬 Películas cargadas:", data.length);
    }
    loadMovies();
  }, []);

  // 🔹 Buscar películas
  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === "") {
      const data = await getPopularMovies();
      setMovies(data);
      return;
    }
    const results = await searchMovies(query);
    setMovies(results);
  };

  // 🔹 Añadir o marcar favoritos
  const handleAddFavorite = async (movieId) => {
    console.log("🩷 Click detectado en película:", movieId);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para agregar a favoritos.");
      return;
    }

    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tmdb_id: movieId }),
        }
      );

      const data = await response.json();
      console.log("💾 Respuesta del backend:", data);

      if (response.ok && data.success) {
        localStorage.setItem(`favorite-${movieId}`, "true");
        setMovies((prev) =>
          prev.map((m) =>
            m.id === movieId ? { ...m, favorite: true } : m
          )
        );
        alert(`💖 "${movie.title}" agregada a favoritos`);
      } else {
        console.warn("⚠️ Backend no respondió correctamente. Guardando localmente.");
        localStorage.setItem(`favorite-${movieId}`, "true");
        setMovies((prev) =>
          prev.map((m) =>
            m.id === movieId ? { ...m, favorite: true } : m
          )
        );
        alert(`💾 "${movie.title}" guardada localmente.`);
      }
    } catch (error) {
      console.error("💥 Error al agregar favorito:", error);
      localStorage.setItem(`favorite-${movieId}`, "true");
      setMovies((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, favorite: true } : m))
      );
      alert(`💾 "${movie.title}" guardada localmente (sin conexión).`);
    }
  };

  // 🔹 Restaurar favoritos desde localStorage
  useEffect(() => {
    const savedFavorites = Object.keys(localStorage)
      .filter((key) => key.startsWith("favorite-"))
      .map((key) => parseInt(key.replace("favorite-", "")));

    setMovies((prev) =>
      prev.map((m) => ({
        ...m,
        favorite: savedFavorites.includes(m.id),
      }))
    );
  }, [movies.length]);

  return (
    <div className="mainview-container">
      <header className="mainview-header">
        <h1 className="title">
          Movie<span>Verse</span>
        </h1>
      </header>

      {/* Barra de búsqueda */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar por título, actor, género o año..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-search">
          🔍
        </button>
      </form>

      {/* Grid de películas */}
      <div className="movies-grid">
        {movies.length > 0 ? (
          movies.slice(0, 9).map((movie) => (
            <div key={movie.id} className="movie-card">
              <div
                className="poster"
                style={{
                  backgroundImage: movie.poster_path
                    ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`
                    : "url(https://via.placeholder.com/500x750?text=Sin+imagen)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <h4 className="movie-title">{movie.title}</h4>

              <div className="buttons">
                <Link to={`/movie/${movie.id}`}>
                  <button className="btn-details">Detalles</button>
                </Link>

                {isLogged && (
                  <button
                    className={`btn-fav ${movie.favorite ? "active" : ""}`}
                    onClick={() => handleAddFavorite(movie.id)}
                  >
                    {movie.favorite
                      ? "💖 En favoritos"
                      : "❤️ Añadir a favoritos"}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron resultados 😢</p>
        )}
      </div>

      {!isLogged && (
        <div className="guest-register">
          <p>👋 Regístrate para guardar tus películas favoritas y más.</p>
          <Link to="/register">
            <button className="btn-register">Registrarse</button>
          </Link>
        </div>
      )}
    </div>
  );
};
