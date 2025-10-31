import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="flex-grow-1">
        <Outlet /> {/*el router pinta la pagina actual */}
      </main>
      <Footer />
    </>
  );
};
