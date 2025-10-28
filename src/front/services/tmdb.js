const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// 🔹 Obtener películas populares por defecto
export async function getPopularMovies() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`
  );
  const data = await res.json();
  return data.results;
}

// 🔹 Buscar películas por título, actor, género o año
export async function searchMovies(query) {
  const encodedQuery = encodeURIComponent(query.trim());

  // Si el usuario pone un año, busca por año
  if (/^\d{4}$/.test(query)) {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&primary_release_year=${query}`
    );
    const data = await res.json();
    return data.results;
  }

  // Si el usuario escribe algo general, busca por título o actor
  const [byTitle, byActor] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodedQuery}`
    ).then((res) => res.json()),
    fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&language=es-ES&query=${encodedQuery}`
    ).then((res) => res.json()),
  ]);

  // Si busca por actor, devuelve las películas de ese actor también
  let actorMovies = [];
  if (byActor.results.length > 0) {
    actorMovies = byActor.results.flatMap((person) => person.known_for || []);
  }

  // Combina resultados sin duplicar
  const merged = [...byTitle.results, ...actorMovies].reduce((acc, movie) => {
    if (!acc.find((m) => m.id === movie.id)) acc.push(movie);
    return acc;
  }, []);

  return merged;
}
