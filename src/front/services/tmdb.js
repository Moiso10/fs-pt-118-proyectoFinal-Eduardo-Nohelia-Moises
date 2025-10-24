// src/front/services/tmdb.js
// Función que trae las películas populares desde TMDB

export async function getPopularMovies() {
  const API_URL =
    "https://api.themoviedb.org/3/movie/popular?language=es-ES&page=1";

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    },
  });

  const data = await response.json();
  return data.results;
}
// 🔍 Buscar películas por título
export async function searchMovies(query) {
  const API_URL = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
    query
  )}&language=es-ES&page=1`;

  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    },
  });

  const data = await response.json();
  return data.results;
}
