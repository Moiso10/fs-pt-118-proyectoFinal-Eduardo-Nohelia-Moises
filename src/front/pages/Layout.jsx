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
    <>
      <PageTransition />
      <Navbar />
      <main className={`flex-grow-1 page-container ${entering ? "is-entering" : ""}`}>
        <Outlet /> {/*el router pinta la pagina actual */}
      </main>
      <Footer />
    </>
  );
};
