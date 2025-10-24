import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar/Navbar";
import { Footer } from "../components/Footer";
import { ContextProvider } from "../appContext.jsx";



export const Layout = () => {
  return (
    <ContextProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Outlet /> {/* Aquí React Router pintará MainView */}
        </main>
        <Footer />
      </div>
    </ContextProvider>
  );
};
