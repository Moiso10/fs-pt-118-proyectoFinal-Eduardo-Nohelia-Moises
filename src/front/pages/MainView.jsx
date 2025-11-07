import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"; //hook personalizado para acceder al estado global
import { getPopularMovies, searchMovies } from "../services/tmdb";
import "./MainView.css";
import { Favorites } from "../components/Favorites"; //componente que maneja el boton de favoritos.
import { markFavorites } from "../services/favorites"; //funcion que compara peliculas con la lista de favoritos del usuario logueado
import { Loading } from "../components/Loading";
export const MainView = () => { //crea y exporta el componente MainView
  const { store } = useGlobalReducer();
  const isLogged = store.auth || !!localStorage.getItem("token"); //comprueba si hay un usuario autenticado
  // sea en el contexto o en localStorage

  // Estados locales
  const [movies, setMovies] = useState([]); //almacena las peliculas que se mostraran
  const [genres, setGenres] = useState([]); //lista de generos que se obtienen de la api externa
  const [selectedGenre, setSelectedGenre] = useState(""); //guarda el genero actual filtrado
  const [query, setQuery] = useState(""); //texto deñ buscador
  const [isLoading, setIsLoading] = useState(true); // 🔸 para el spinner


  // 🔹 Cargar películas populares al inicio
  useEffect(() => {
    async function loadMovies() {
      try {
        setIsLoading(true); // 🔹 activa el spinner
        const data = await getPopularMovies();
        const moviesWithFavorites = await markFavorites(data);
        setMovies(moviesWithFavorites);
      } catch (err) {
        console.error("💥 Error al cargar películas populares:", err);
      } finally {
        setIsLoading(false); // 🔹 apaga el spinner
      }
    }

    loadMovies();
  }, []);

  // 🔹 Cargar lista de generos desde tmdb
  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await fetch(
          "https://api.themoviedb.org/3/genre/movie/list?language=es-ES",
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`, //usa el token de acceso guardado en .env
            },
          }
        );
        const data = await res.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Error al cargar géneros:", err);  //si hay error se muestra en consola
      }
    }
    loadGenres();
  }, []);


  // 🔹 Buscar peliculas por titulo, actor, año
  const handleSearch = async (e) => {
    e.preventDefault(); //evita que se recargue la pagina

    try {
      let data;

      // Si el campo esta vacio, recarga las populares
      if (query.trim() === "") {
        data = await getPopularMovies();
      } else {
        //si hay texto busca usando searchMovies(query) en TMDb
        data = await searchMovies(query);
      }

      // Marca favoritas en la misma llamada y actualiza
      const moviesWithFavorites = await markFavorites(data);
      setMovies(moviesWithFavorites);
    } catch (err) {
      console.error("💥 Error al buscar películas:", err);
    }
  };

  // 🔹 Filtrar por genero
  const handleGenreChange = async (e) => {
    const genreId = e.target.value;
    setSelectedGenre(genreId); //se ejecuta cada vez que usuario cambia de genero en el select

    try {
      let moviesData;

      // 🔹 Si el usuario borra el filtro vuelve y recarga las populares
      if (genreId === "") {
        moviesData = await getPopularMovies();
      } else {
        // 🔹 Cargar peliculas del genero desde TMDB
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=es-ES&page=1`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
            },
          }
        );
        const data = await res.json();
        moviesData = data.results || [];
      }

      // 🔹 Marca automáticamente las favoritas
      const moviesWithFavorites = await markFavorites(moviesData);
      setMovies(moviesWithFavorites);
    } catch (err) {
      console.error("💥 Error al filtrar por género:", err);
    }
  };

  // 🌀 Mostrar spinner mientras carga
  if (isLoading)
    return (
      <div className="mainview-container">
        <Loading message="Cargando películas..." />
      </div>
    );
  return (
    <div className="mainview-container">
      <header className="mainview-header">
        <h1 className="title">
          Movie<span>Verse</span>
        </h1>
      </header>

      {/* FILTRO DE GÉNERO */}
      <div className="genre-select-container">
        <label htmlFor="genre-select" className="genre-label">
          🎬 Género:
        </label>
        <select
          id="genre-select"
          className="genre-select"
          value={selectedGenre}
          onChange={handleGenreChange}
        >
          <option value="">Todos</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      {!isLogged && (
        <div className="guest-register">
          <p>👋 Regístrate para guardar tus películas favoritas y más.</p>
        </div>
      )}

      {/* Barra de búsqueda */}
      {selectedGenre && (
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar por título, actor o año..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-search">
            🔍
          </button>
        </form>
      )}

      {/* GRID de películas */}
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
                }}
              ></div>

              <h4 className="movie-title">{movie.title}</h4>

              <div className="buttons">
                <Link to={`/movie/${movie.id}`}>
                  <button className="btn-details">Detalles</button>
                </Link>

                {isLogged && <Favorites tmdbId={movie.id} title={movie.title} mode="button" />}

              </div>
            </div>
          ))
        ) : (
          <p>No se encontraron resultados 😢</p>
        )}
      </div>
    </div>
  );
};
