import React, { useState, useEffect, useContext } from "react"; // Herramientas desde React
import { useParams, Link } from "react-router-dom"; //// useParams para obtener el id desde la URL (/movie/1234)
import { Context } from "../appContext";
import "./MovieDetail.css";

// Componente principal que muestra los detalles de una pelicula
export const MovieDetail = () => {
  const { id } = useParams();     // Obtiene el parametro id de la URL (/movie/1234 (id = 1234)
  const { store } = useContext(Context); // Accede al store global para saber  si hay sesion iniciada
  const isLogged = store.auth || localStorage.getItem("token");
  const token = localStorage.getItem("token");

  // Estados locales 
  const [movie, setMovie] = useState(null);         //Guarda los detalles de la pelicula
  const [reviews, setReviews] = useState([]);      // Muestra las reseñas existentes
  const [showForm, setShowForm] = useState(false); // Controla si se muestra el formulario de reseña
  const [form, setForm] = useState({ title: "", body: "", valoration: 0 }); // Datos del formulario


  // Primer useEffect obtiene los detalles de la pelicula desde la api tmdb
   useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${
        import.meta.env.VITE_TMDB_API_KEY
      }&language=es-ES`
    )
      .then((res) => res.json())           // Convierte la respuesta a JSON
      .then((data) => setMovie(data))      // Guarda la informacion del estado movie 
      .catch((err) => console.error(err)); // Si algo falla lo muestra en consola
  }, [id]);        // Se ejecuta  cada vez que cambias el id por si navegas entre peliculas

  // Segundo useEffect el que se encarga de cargar las reselas almecenadas en el backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => {

        // Verifica que data.reviews sea un array antes de usarlo
        const safeReviews = Array.isArray(data.reviews) ? data.reviews : []; 
        setReviews(safeReviews);
      })
      .catch((err) => console.error(err));
  }, [id]);

  // Funcion que envia una nueva reseña al backend
 const handleSubmit = async (e) => {
  e.preventDefault();    // Evita que el formulario recargue la pagina

  try {
    // Crea el cuerpo  del request que enviara al backend
    const body = {
      tmdb_id: id,
      title: form.title,
      body: form.body,
      //  Este truco evita el error del backend, mandando un objeto o string que Python pueda "hash"
      valoration: { valoration: parseInt(form.valoration) || 0 }
    };

      // Envia los datos del backend con fetch
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // JSON
        Authorization: `Bearer ${token}`,   // Token para autenticar
      },
      body: JSON.stringify(body),           // Convierte el objeto en string JSON
    });

    const data = await response.json();    // recibe la respuesta de BE

    console.log("Respuesta backend:", data);

    if (data.success) {
      setReviews([...reviews, data.reviews]); // si guarda añade la nueva reseña
      setForm({ title: "", body: "", valoration: 0 });  // limpia el formulario
      setShowForm(false);                               // Cierra el formulario
    } else {
      console.warn("⚠️ Error del backend:", data.error);  // si BE devuelve error muestra un aviso
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
