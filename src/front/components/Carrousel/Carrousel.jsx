import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Carrousel.css";

// Carrusel 3D con las 10 películas mejor valoradas desde TMDb
export const Carrousel = ({ onSlideChange }) => {
  const navigate = useNavigate();

  // Lista de películas top-rated con sus imágenes
  const [movies, setMovies] = useState([]); // { id, title, original_title, original_language, backdrop, poster }
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const delayMs = 10000; // 10s entre fotos

  const prevIndex = useMemo(() => (index - 1 + movies.length) % (movies.length || 1), [index, movies.length]);
  const nextIndex = useMemo(() => (index + 1) % (movies.length || 1), [index, movies.length]);

  // Cargar top-rated desde TMDb
  useEffect(() => {
    const loadTopRated = async () => {
      try {
        const res = await fetch("https://api.themoviedb.org/3/movie/top_rated?language=es-ES&page=1", {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
        });
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];
        const top10 = results
          .filter((m) => m.backdrop_path || m.poster_path)
          .slice(0, 10)
          .map((m) => ({
            id: m.id,
            title: m.title || m.name || "",
            original_title: m.original_title || "",
            original_language: m.original_language || "",
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          }));
        setMovies(top10);
      } catch (err) {
        console.error("Error al cargar top-rated desde TMDb:", err);
        setMovies([]);
      }
    };
    loadTopRated();
  }, []);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    // autoplay: avanza cada 10s
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % movies.length);
    }, delayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies.length]);

  // Notificar cambios de slide al padre
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    if (typeof onSlideChange === "function") {
      const current = movies[index];
      const bg = current?.backdrop || current?.poster || null;
      if (bg) onSlideChange(bg, index);
    }
  }, [index, movies, onSlideChange]);

  // Controles manuales
  const prev = useCallback(() => setIndex((prev) => (prev - 1 + movies.length) % (movies.length || 1)), [movies.length]);
  const next = useCallback(() => setIndex((prev) => (prev + 1) % (movies.length || 1)), [movies.length]);

  // Navegación por teclado
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    },
    [prev, next]
  );

  return (
    <>
      <div className="carrousel-row">
        <button
          className="btn btn-sm btn-outline-light carrousel-nav carrousel-nav-left"
          onClick={prev}
          aria-label="Anterior"
          disabled={movies.length === 0}
        >
          ◀
        </button>

        <div className="carrousel" aria-roledescription="carousel" tabIndex={0} onKeyDown={onKeyDown}>
          {movies.length > 0 && (
            <div
              className="carrousel-bg"
              aria-hidden="true"
              style={{ backgroundImage: `url(${movies[index].backdrop || movies[index].poster})` }}
            />
          )}
          <div className="carrousel-stage">
            {movies.map((m, i) => {
              const isActive = i === index;
              const isPrev = i === prevIndex;
              const isNext = i === nextIndex;
              const className = [
                "carrousel-slide",
                isActive ? "is-active" : "",
                isPrev ? "is-prev" : "",
                isNext ? "is-next" : "",
                !isActive && !isPrev && !isNext ? "is-far" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  className={className}
                  key={i}
                  aria-hidden={!isActive && !isPrev && !isNext}
                  onClick={isPrev ? prev : isNext ? next : isActive ? () => navigate(`/movie/${m.id}`) : undefined}
                  role={isPrev || isNext ? "button" : undefined}
                >
                  <img src={m.backdrop || m.poster} alt={m.title || `Película ${i + 1}`} loading="lazy" decoding="async" />
                </div>
              );
            })}
            {movies.length === 0 && (
              <div className="carrousel-slide is-active" aria-hidden={false}>
                <div className="carrousel-empty">
                  No se pudieron cargar imágenes desde TMDb.
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          className="btn btn-sm btn-outline-light carrousel-nav carrousel-nav-right"
          onClick={next}
          aria-label="Siguiente"
          disabled={movies.length === 0}
        >
          ▶
        </button>
      </div>

      {movies.length > 0 && (
        <div className="carrousel-titles" aria-live="polite">
          <h2 className="carrousel-title-es">{movies[index].title}</h2>
          {movies[index].original_language === "en" && movies[index].original_title && movies[index].original_title !== movies[index].title && (
            <h3 className="carrousel-title-en">{movies[index].original_title}</h3>
          )}
        </div>
      )}
    </>
  );
};