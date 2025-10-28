import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Context } from "../appContext";
import "./MovieDetail.css";

export const MovieDetail = () => {
  const { id } = useParams();
  const { store } = useContext(Context);
  const isLogged = store.auth || localStorage.getItem("token");
  const token = localStorage.getItem("token");

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", valoration: 0 });

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES`
    )
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const safeReviews = Array.isArray(data.reviews) ? data.reviews : [];
        setReviews(safeReviews);
      })
      .catch((err) => console.error(err));
  }, [id]);

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // ⚙️ Creamos el body de forma compatible con el backend de tu compañero
    const body = {
      tmdb_id: id,
      title: form.title,
      body: form.body,
      // 👇 Este truco evita el error del backend, mandando un objeto o string que Python pueda "hash"
      valoration: { valoration: parseInt(form.valoration) || 0 }
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log("Respuesta backend:", data);

    if (data.success) {
      setReviews([...reviews, data.reviews]);
      setForm({ title: "", body: "", valoration: 0 });
      setShowForm(false);
    } else {
      console.warn("⚠️ Error del backend:", data.error);
      alert("No se pudo guardar la reseña. Intenta más tarde.");
    }
  } catch (error) {
    console.error("💥 Error al enviar reseña:", error);
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
              {isLogged ? (
                <>
                  <button
                    className="btn-red"
                    onClick={() => setShowForm(!showForm)}
                  >
                    {showForm ? "❌ Cancelar reseña" : "✍️ Añadir reseña"}
                  </button>
                  <button className="btn-fav">❤️ Añadir a favoritos</button>
                </>
              ) : (
                <Link to="/login" className="btn-red">🔒 Inicia sesión</Link>
              )}
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
