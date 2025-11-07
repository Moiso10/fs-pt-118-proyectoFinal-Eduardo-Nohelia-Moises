import React, { useState, useEffect } from "react";
import "./Reviews.css";
import userServices from "../../services/userServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";


const MAX_LEN = 255;

export default function Reviews({ open, onClose, onSubmitted, auth, currentUser }) {
  const {store, dispatch} = useGlobalReducer();

// Estados para controlar las estadisticas del usuario y si puede dejar reseña
  const [userStats, setUserStats] = useState({ views_count: 0, favorites_count: 0 });
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
  const fetchStats = async () => {
    if (!auth) return;
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.success) {
        setUserStats(data);
        //  minimo 10 vistas y 5 favoritos
        setIsEligible(data.views_count >= 10 && data.favorites_count >= 5);
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    }
  };
  fetchStats();
}, [auth]);


  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const alias = currentUser?.username || (currentUser?.email ? currentUser.email.split('@')[0] : 'Invitado');

  const handleStarClick = (value) => {
    if (!auth) return;
    setRating(value);
  };

  const handleCommentChange = (e) => {
    if (!auth) return;
    const val = e.target.value.slice(0, MAX_LEN);
    setComment(val);
  };

  const handleCancel = () => {
    if (submitting) return;
    setRating(0);
    setComment("");
    setError("");
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!auth) return;
     if (!isEligible) {
    setError("Necesitas ver al menos 10 películas y tener 5 favoritas para dejar una reseña.");
    return;
  }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: "Reseña de MovieVerse",
        body: comment.trim(),
        valoration: rating,
      };
      const resp = await userServices.createMovieVerseReview(payload);
      if (resp?.success) {
        onSubmitted?.();
        handleCancel();
      } else {
        setError("No se pudo enviar la reseña. Revisa tu sesión o conexión.");
      }
    } catch (e) {
      setError("Error de red al enviar la reseña.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal d-block reviews-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tu reseña de MovieVerse</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={handleCancel}></button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-2">Comentando como @{store.profile?.username || store.profile?.email}</p>
            {!auth && (
              <div className="alert alert-info" role="alert">
                Debes iniciar sesión para puntuar y comentar.
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Puntuación</label>
              <div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <i
                    key={i}
                    className={
                      `${i <= rating ? "fa-solid fa-star text-warning fs-4 me-1" : "fa-regular fa-star text-secondary fs-4 me-1"} ${auth ? "star-auth" : "star-disabled"}`
                    }
                    role="button"
                    aria-label={`Establecer ${i} estrellas`}
                    onClick={() => handleStarClick(i)}
                  ></i>
                ))}
              </div>
              {auth && rating === 0 && (
                <small className="text-danger">Selecciona una puntuación.</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Comentario</label>
              <textarea
                className="form-control"
                value={comment}
                onChange={handleCommentChange}
                rows={4}
                maxLength={MAX_LEN}
                placeholder="Escribe tu opinión (máx. 255 caracteres)"
                readOnly={!auth}
              />
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">{comment.length}/{MAX_LEN}</small>
                {auth && comment.trim().length === 0 && (
                  <small className="text-danger">El comentario es requerido.</small>
                )}
              </div>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
          </div>
          <div className="modal-footer">
           {!isEligible && auth && (
  <small className="text-warning me-auto mb-2">
    🔒 Debes tener 10 películas vistas y 5 favoritas para enviar tu reseña.
  </small>
)}

            <button className="btn btn-primary" onClick={handleSubmit} disabled={!auth || submitting}>
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}