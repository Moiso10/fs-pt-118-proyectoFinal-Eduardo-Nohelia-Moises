import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Context } from "../appContext";
import "./MovieDetail.css";

export const MovieDetail = () => {
  const { id } = useParams();
  const { store } = useContext(Context);
  const isLogged = store.auth || !!localStorage.getItem("token");
  const token = localStorage.getItem("token");

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", valoration: 0 });
  const [favoriteAdded, setFavoriteAdded] = useState(false);


  useEffect(() => {
    const saved = localStorage.getItem(`favorite-${id}`);
    if (saved === "true") setFavoriteAdded(true);
  }, [id]);

  // 🔹 Cargar detalles desde TMDB
  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES`
    )
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error("Error al cargar película:", err));
  }, [id]);

  // 🔹 Cargar reseñas desde backend (blindado contra errores de respuesta)
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Respuesta inválida del servidor");

        // Si el backend devuelve algo roto o vacío, no explota
        const safeReviews = Array.isArray(data.reviews)
          ? data.reviews.map(r => ({
            ...r,
            valoration: parseInt(r.valoration) || 0, // arregla el tuple raro
            title: r.title || "Sin título",
            body: r.body || "Sin contenido"
          }))
          : [];

        setReviews(safeReviews);
      } catch (error) {
        console.warn("⚠️ No se pudieron cargar las reseñas:", error.message);
        setReviews([]);
      }
    };
    loadReviews();
  }, [id]);


  // 🔹 Enviar reseña (blindado contra backend tonto)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    const cleanValoration = parseInt(form.valoration);
    if (isNaN(cleanValoration) || cleanValoration < 1 || cleanValoration > 5) {
      alert("La valoración debe ser un número entre 1 y 5.");
      return;
    }

    const body = {
      tmdb_id: id,
      title: form.title.trim() || "Sin título",
      body: form.body.trim() || "Sin contenido",
      valoration: cleanValoration
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.warn("⚠️ Error backend:", data.error || "Respuesta inválida");
        alert("No se pudo guardar la reseña. Error del servidor.");
        return;
      }

      // Si la respuesta está mal formada, igual se guarda en frontend
      const review = data.reviews || body;
      review.valoration = parseInt(review.valoration) || 0;
      setReviews([...reviews, review]);

      setForm({ title: "", body: "", valoration: 0 });
      setShowForm(false);
      alert("🎬 Reseña guardada con éxito.");
    } catch (error) {
      console.error("💥 Error al enviar reseña:", error);
      alert("Error de conexión. Intenta más tarde.");
    }
  };


  const handleAddFavorite = async () => {
    if (!token) {
      alert("Debes iniciar sesión para agregar a favoritos.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tmdb_id: id }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFavoriteAdded(true);
        alert("❤️ Película agregada a favoritos (guardada en el servidor).");
        localStorage.setItem(`favorite-${id}`, "true");
      } else {
        console.warn("⚠️ Backend no respondió bien, se simula el favorito.");
        setFavoriteAdded(true);
        localStorage.setItem(`favorite-${id}`, "true");
        alert("💖 Guardado localmente (backend no disponible).");
      }
    } catch (error) {
      console.error("Error al agregar favorito:", error);
      // fallback: lo guardamos localmente para que al menos funcione visualmente
      setFavoriteAdded(true);
      localStorage.setItem(`favorite-${id}`, "true");
      alert("💖 Guardado localmente (error de conexión).");
    }
  };


  if (!movie) {
    return (
      <div className="movie-detail-loading">
        <p>Cargando detalles de la película...</p>
      </div>
    );
  }

  return (
    <div
      className="movie-detail-container"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="movie-detail-overlay">
        <div className="movie-detail-card">
          <img
            className="movie-detail-poster"
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />

          <div className="movie-detail-info">
            <h1>{movie.title}</h1>
            <p className="movie-detail-overview">{movie.overview}</p>
            <p><strong>Año:</strong> {movie.release_date?.split("-")[0]}</p>
            <p><strong>Géneros:</strong> {movie.genres?.map((g) => g.name).join(", ")}</p>

            <div className="actions">
              <button
                className="btn-red"
                title={isLogged ? "Añade una reseña" : "Debes iniciar sesión para dejar una reseña"}
                disabled={!isLogged}
                onClick={() => isLogged && setShowForm(!showForm)}
              >
                {showForm ? "❌ Cancelar reseña" : "✍️ Añadir reseña"}
              </button>


              <button
                className="btn-fav"
                title={isLogged ? "Añade a favorito" : "Debes iniciar sesión para añadir favorito"}
                onClick={handleAddFavorite}
                disabled={!isLogged}
              >
                {favoriteAdded ? "💖 En favoritos" : "❤️ Añadir a favoritos"}
              </button>
            </div>

            <button className="btn-back" onClick={() => window.history.back()}>
              ← Volver
            </button>

            <div className="movie-reviews">
              <h3>Reseñas</h3>
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      <strong>{r.title || "Sin título"}</strong>
                      <span className="review-stars">
                        {"⭐".repeat(r.valoration || 0)}
                      </span>
                    </div>
                    <p>{r.body}</p>
                    {r.user && (
                        <small>
                          👤 {r.user.email || "Usuario desconocido"}
                        </small>
                      )}
                  </div>
                ))
              ) : (
                <p className="no-reviews">No hay reseñas todavía.</p>
              )}

              {isLogged && showForm && (
                <form onSubmit={handleSubmit} className="review-form">
                  <input
                    type="text"
                    placeholder="Título de la reseña"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Escribe tu reseña..."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                  />
                  <label>Valoración (1 a 5):</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={form.valoration}
                    onChange={(e) =>
                      setForm({ ...form, valoration: e.target.value })
                    }
                    required
                  />
                  <button type="submit" className="btn-save-review">
                    💾 Guardar reseña
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
