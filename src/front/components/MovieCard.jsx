// src/front/components/MovieCard.jsx
import { Link } from "react-router-dom";

export const MovieCard = ({ movie, isLogged }) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=Sin+imagen";

  return (
    <div className="movie-card">
      <div
        className="poster"
        style={{
          backgroundImage: `url(${posterUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <h4 className="movie-title">{movie.title}</h4>

      <div className="buttons">
        <Link to={`/movie/${movie.id}`}>
          <button className="btn-details">Ver detalles</button>
        </Link>

        {isLogged && (
          <>
            <button className="btn-fav">❤️ Favorito</button>
            <button className="btn-review">📝 Reseñar</button>
          </>
        )}
      </div>
    </div>
  );
};
