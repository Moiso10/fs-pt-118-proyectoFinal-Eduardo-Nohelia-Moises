import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer";
import React, { useEffect, useState } from "react";
import PageTransition from "../components/Transition/PageTransition";

export const Layout = () => {
  const location = useLocation();
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 520);
    return () => clearTimeout(t);
  }, [location.pathname]);
  return (
    <div className="d-flex flex-column min-vh-100">
      <PageTransition />
      <Navbar />
      <main className={`flex-grow-1 d-flex flex-column page-container ${entering ? "is-entering" : ""}`}>
        <Outlet /> {/*el router pinta la pagina actual */}
      </main>
      <Footer />
    </div>
  );
};
