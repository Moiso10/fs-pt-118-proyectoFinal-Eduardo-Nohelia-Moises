import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./MovieDetail.css";
import { getStreamingAvailability } from "../services/streaming";

export const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    async function loadMovie() {
      const API_URL = `https://api.themoviedb.org/3/movie/${id}?language=es-ES`;
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
        },
      });
      const data = await response.json();
      setMovie(data);

      // 🔹 Luego busca las plataformas por título
      const availableOn = await getStreamingAvailability(data.title);
      setPlatforms(availableOn);
    }
    loadMovie();
  }, [id]);

  if (!movie) {
    return <div className="movie-detail-loading">Cargando detalles...</div>;
  }

  return (
    <div
      className="movie-detail-container"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`,
      }}
    >
      <div className="movie-detail-overlay">
        <div className="movie-detail-card">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="movie-detail-poster"
          />
          <div className="movie-detail-info">
            <h1>{movie.title}</h1>
            <p>{movie.overview}</p>
            <p><strong>Fecha de estreno:</strong> {movie.release_date}</p>
            <p><strong>Calificación:</strong> ⭐ {movie.vote_average}</p>

            {platforms.length > 0 ? (
              <p>
                <strong>Disponible en:</strong> {platforms.join(", ")}
              </p>
            ) : (
              <p><em>No disponible en plataformas conocidas.</em></p>
            )}

            <Link to="/inicio">
              <button className="btn-back">⬅ Volver</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
