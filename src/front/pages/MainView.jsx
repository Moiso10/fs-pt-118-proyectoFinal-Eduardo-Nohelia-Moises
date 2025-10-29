
// Importa React y algunos hooks necesarios
import React, { useContext, useEffect, useState } from "react";
// Importa link de react-router para la navegacion interna sin recargar la pagina
import { Link } from "react-router-dom";
// Importe el contexto global donde se guarda el estado global
import { Context } from "../appContext";
// Importa las funciones que se comunican con la api TMDB
import { getPopularMovies, searchMovies } from "../services/tmdb";
import "./MainView.css";

export const MainView = () => {
    const { store } = useContext(Context);
    const isLogged = store.auth;                     // Verifica si el usuario esta logueado

    // Estados locales del componente
    const [movies, setMovies] = useState([]);   // guarda la lista de peliculas
    const [query, setQuery] = useState("");     // guarda el texto que el usuario escribe en el buscador


    // Cargar peliculas populares por defecto  useEffect se ejecuta una vez cuando sw monta el componente
    useEffect(() => {
        async function loadMovies() {
            const data = await getPopularMovies();  // Llama a la funcion que pide peliculas populares a TMDB
            setMovies(data);                        // Guarda el resultado en el estado local movies
        }
        loadMovies();
    }, []); // Este array vacio hace que solo se ejecute una vez

    //  Funcion que maneja la busqueda de peliculas
    const handleSearch = async (e) => {
        e.preventDefault();                         // Evita que el formulario recargue la pagina
        // Si el usuario no escribe nada, vuelve a mostrar las populares
        if (query.trim() === "") {
            const data = await getPopularMovies(); // Si el campo esta vacio, vuelve a populares
            setMovies(data);                       // Guarda los resultados de la busqueda
            return;
        }
        const results = await searchMovies(query);
        setMovies(results);
    };
    // Renderizado del componente
    return (
        <div className="mainview-container">
            <header className="mainview-header">
                <h1 className="title">
                    Movie<span>Verse</span>
                </h1>
            </header>

            {/* Barra de busqueda */}
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Buscar por título, actor, género o año..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn-search">🔍</button>
            </form>


            {/*grid de peliculas */}
            <div className="movies-grid">
                {movies.length > 0 ? (
                    movies.slice(0, 6).map((movie) => (
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

                                {isLogged && <button className="btn-fav">Favoritos</button>}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron resultados 😢</p>
                )}
            </div>

            {/* Si no esta logueado */}
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
