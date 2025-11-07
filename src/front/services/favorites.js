// src/front/services/favorites.js

/**
 * Marca las películas que son favoritas del usuario logueado.
 * Evita duplicar la lógica del endpoint /favorites/check/:tmdb_id
 */
export async function markFavorites(movies) {
  const token = localStorage.getItem("token");
  if (!token) return movies;

  try {
    const checked = await Promise.all(
      movies.slice(0, 9).map(async (movie) => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/favorites/check/${
              movie.id
            }`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const json = await res.json();

          if (json.success && json.is_favorite) {
            return {
              ...movie,
              favorite: true,
              favorite_id: json.favorite_id,
            };
          }
        } catch (err) {
          console.error("Error al verificar favorito:", movie.id, err);
        }
        return movie;
      })
    );

    return checked;
  } catch (err) {
    console.error("💥 Error general en markFavorites:", err);
    return movies;
  }
}
