import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./Carrousel.css";

// Carrusel 3D con 20 fotografías y delay de 10 segundos entre fotos
export const Carrousel = ({ onSlideChange }) => {
  // Cargar imágenes desde assets/carrousel usando Vite import.meta.glob
  const entries = useMemo(
    () => Object.entries(
      import.meta.glob("../../assets/carrousel/*.{jpg,jpeg,png,svg,webp}", { eager: true })
    ),
    []
  );

  // Separar imágenes reales de placeholders (photoXX.svg)
  const realImages = useMemo(
    () => entries.filter(([path]) => !/photo\d+\.svg$/i.test(path)).map(([, mod]) => mod.default),
    [entries]
  );

  const fallbackImages = useMemo(
    () => entries.filter(([path]) => /photo\d+\.svg$/i.test(path)).map(([, mod]) => mod.default),
    [entries]
  );

  // Construir lista final: prioridad realImages, completar con placeholders hasta 20
  const images = useMemo(() => {
    // Orden estable por nombre de archivo para evitar saltos en el build
    const sortByName = (a, b) => {
      const na = String(a).split("/").pop().toLowerCase();
      const nb = String(b).split("/").pop().toLowerCase();
      return na.localeCompare(nb, undefined, { numeric: true, sensitivity: "base" });
    };
    const srcs = [...realImages].sort(sortByName);
    let i = 0;
    while (srcs.length < 20 && fallbackImages.length > 0) {
      srcs.push(fallbackImages.sort(sortByName)[i % fallbackImages.length]);
      i++;
    }
    return srcs;
  }, [realImages, fallbackImages]);

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const delayMs = 10000; // 10s entre fotos

  const prevIndex = useMemo(() => (index - 1 + images.length) % images.length, [index, images.length]);
  const nextIndex = useMemo(() => (index + 1) % images.length, [index, images.length]);

  useEffect(() => {
    if (!images || images.length === 0) return;
    // autoplay: avanza cada 10s
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, delayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images.length]);

  // Notificar cambios de slide al padre
  useEffect(() => {
    if (!images || images.length === 0) return;
    if (typeof onSlideChange === "function") {
      onSlideChange(images[index], index);
    }
  }, [index, images, onSlideChange]);

  // Controles manuales
  const prev = useCallback(() => setIndex((prev) => (prev - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex((prev) => (prev + 1) % images.length), [images.length]);

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
    <div className="carrousel" aria-roledescription="carousel" tabIndex={0} onKeyDown={onKeyDown}>
      {images.length > 0 && (
        <div
          className="carrousel-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url(${images[index]})` }}
        />
      )}
      <div className="carrousel-stage">
        {images.map((src, i) => {
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
              onClick={isPrev ? prev : isNext ? next : undefined}
              role={isPrev || isNext ? "button" : undefined}
            >
              <img src={src} alt={`Foto ${i + 1}`} loading="lazy" decoding="async" />
            </div>
          );
        })}
        {images.length === 0 && (
          <div className="carrousel-slide is-active" aria-hidden={false}>
            <div className="carrousel-empty">
              No se encontraron imágenes en `src/front/assets/carrousel/`.
            </div>
          </div>
        )}
      </div>
      <div className="carrousel-controls">
        <button className="btn btn-sm btn-outline-light" onClick={prev} aria-label="Anterior">
          ◀
        </button>
        <span className="carrousel-indicator">{Math.min(index + 1, images.length || 1)} / {images.length || 0}</span>
        <button className="btn btn-sm btn-outline-light" onClick={next} aria-label="Siguiente">
          ▶
        </button>
      </div>
    </div>
  );
};