import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Carrousel.css";

// Carrousel con 20 fotografías y delay de 10 segundos entre fotos
export const Carrousel = ({ onSlideChange }) => {
  // Cargar imágenes desde assets/carrousel usando Vite import.meta.glob
  const entries = useMemo(() => (
    Object.entries(import.meta.glob("../assets/carrousel/*.{jpg,jpeg,png,svg}", { eager: true }))
  ), []);

  // Separar imágenes reales de placeholders (photoXX.svg)
  const realImages = useMemo(() => (
    entries
      .filter(([path]) => !/photo\d+\.svg$/i.test(path))
      .map(([, mod]) => mod.default)
  ), [entries]);

  const fallbackImages = useMemo(() => (
    entries
      .filter(([path]) => /photo\d+\.svg$/i.test(path))
      .map(([, mod]) => mod.default)
  ), [entries]);

  // Construir lista final: prioridad realImages, completar con placeholders hasta 20
  const images = useMemo(() => {
    const srcs = [...realImages];
    let i = 0;
    while (srcs.length < 20 && fallbackImages.length > 0) {
      srcs.push(fallbackImages[i % fallbackImages.length]);
      i++;
    }
    return srcs;
  }, [realImages, fallbackImages]);

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const delayMs = 10000; // 10s entre fotos

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
  const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setIndex((prev) => (prev + 1) % images.length);

  return (
    <div className="carrousel" aria-roledescription="carousel">
      <div className="carrousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <div className="carrousel-slide" key={i} aria-hidden={i !== index}>
            <img src={src} alt={`Foto ${i + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
      <div className="carrousel-controls">
        <button className="btn btn-sm btn-outline-light" onClick={prev} aria-label="Anterior">◀</button>
        <span className="carrousel-indicator">{index + 1} / {images.length}</span>
        <button className="btn btn-sm btn-outline-light" onClick={next} aria-label="Siguiente">▶</button>
      </div>
    </div>
  );
};