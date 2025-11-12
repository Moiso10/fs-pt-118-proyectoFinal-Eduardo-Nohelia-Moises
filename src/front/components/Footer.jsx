import "./Footer.css";
import logo from "../assets/img/logo1-01-02.png";


export const Footer = () => (
    <footer className="footer footer-3d mt-auto py-3">
        <div className="footer-content">
            <img src={logo} alt="MovieVerse logo" className="footer-logo" />
            <p className="footer-text">Hecho por Moises, Nohelia y Eduardo</p>
        </div>
    </footer>
);
