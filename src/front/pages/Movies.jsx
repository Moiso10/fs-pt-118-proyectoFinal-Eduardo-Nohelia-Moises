import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../appContext";
import "./Movies.css";

export const Movies = () => {
  const { store } = useContext(Context);
  const isLogged = store.auth || !!localStorage.getItem("token");

  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  // 🔹 Cargar tres listas iniciales (popular, top rated, upcoming)
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const [popularRes, topRatedRes, upcomingRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`),
          fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=es-ES`),
          fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=es-ES`),
        ]);

        const popularData = await popularRes.json();
        const topRatedData = await topRatedRes.json();
        const upcomingData = await upcomingRes.json();

        setPopular(popularData.results || []);
        setTopRated(topRatedData.results || []);
        setUpcoming(upcomingData.results || []);
      } catch (err) {
        console.error("Error cargando películas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // 🔍 Buscar películas por título, actor o año
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Error al buscar:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Renderiza cada grid (reutilizable)
  const renderGrid = (title, moviesList) => (
    <section className="movie-section">
      <h2>{title}</h2>
      <div className="movie-grid">
        {moviesList.slice(0, 9).map((movie) => (
          <div key={movie.id} className="movie-card">
            <div
              className="poster"
              style={{
                backgroundImage: movie.poster_path
                  ? `url(https://image.tmdb.org/t/p/w500${movie.poster_path})`
                  : "url(https://via.placeholder.com/300x450?text=Sin+imagen)",
              }}
            />
            <h4>{movie.title}</h4>
            <div className="buttons">
              <Link to={`/movie/${movie.id}`}>
                <button className="btn-details">Detalles</button>
              </Link>
              {isLogged && <button className="btn-fav">❤️</button>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="movies-container">
      <header className="movies-header">
        <h1>Catálogo de Películas</h1>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Buscar por título, actor, año..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>
      </header>

      {loading && <p className="loading">Cargando películas...</p>}

      {!loading && results.length > 0 && renderGrid("Resultados de búsqueda", results)}

      {!loading && results.length === 0 && (
        <>
          {renderGrid("🎬 Más Populares", popular)}
          {renderGrid("⭐ Mejor Valoradas", topRated)}
          {renderGrid("🆕 Próximos Estrenos", upcoming)}
        </>
      )}
    </div>
  );
};
