import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../appContext";
import { getPopularMovies, searchMovies } from "../services/tmdb";
import "./MainView.css";

export const MainView = () => {
    const { store } = useContext(Context);
    const isLogged = store.auth;
    const [movies, setMovies] = useState([]);
    const [query, setQuery] = useState("");

    // Cargar peliculas populares por defecto
    useEffect(() => {
        async function loadMovies() {
            const data = await getPopularMovies();
            setMovies(data);
        }
        loadMovies();
    }, []);

    //  Buscar peliculas por titulo
    const handleSearch = async (e) => {
        e.preventDefault();
        if (query.trim() === "") {
            const data = await getPopularMovies(); // Si el campo esta vacio, vuelve a populares
            setMovies(data);
            return;
        }
        const results = await searchMovies(query);
        setMovies(results);
    };

    return (
        <div className="mainview-container">
            <header className="mainview-header">
                <h1 className="title">
                    Movie<span>Verse</span>
                </h1>
            </header>

           {/* Barra de busqueda mejorada */}
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
