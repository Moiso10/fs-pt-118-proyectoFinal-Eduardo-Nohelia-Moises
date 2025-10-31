import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPopularMovies } from "../services/tmdb";

export const Movies = () => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        getPopularMovies().then(setMovies);
    }, []);

    return (
        <div className="movie-grid">
            {movies.map(movie => (
                <div key={movie.id} className="movie-card">
                    <Link to={`/movie/${movie.id}`}>
                        <img
                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                            alt={movie.title}
                        />
                    </Link>
                    <h3>{movie.title}</h3>
                </div>
            ))}
        </div>
    );
};
