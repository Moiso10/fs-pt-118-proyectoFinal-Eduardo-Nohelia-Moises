import React from "react";
import "./Loading.css";

export const Loading = ({ message = "Cargando películas..." }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};
