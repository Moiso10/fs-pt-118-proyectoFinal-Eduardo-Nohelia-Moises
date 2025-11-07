import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./PageTransition.css";

export default function PageTransition() {
  const location = useLocation();
  const [active, setActive] = useState(true); // show on first load

  useEffect(() => {
    // Trigger cambio de ruta para activar la transición
    setActive(true);
    const t = setTimeout(() => setActive(false), 650);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return active ? (
    <div className="nv-transition" aria-hidden>
      <div className="nv-transition-glow" />
    </div>
  ) : null;
}