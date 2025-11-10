import { Link, useNavigate } from "react-router-dom";
import movieVerseLogo from "../../assets/img/MovieVerse.png";
import "./Navbar.css";
import useGlobalReducer from "../../hooks/useGlobalReducer";


export const Navbar = () => {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()

    const handleLogout = () => {

        dispatch({ type: "user_logged_out" });

        navigate("/");
    };


    return (
        <nav className="navbar navbar-expand-lg nav-3d">
            <div className="container">
                <Link to="/" className="navbar-brand mb-0">
                    <span className="mv-title">Movie<span>Verse</span></span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">
                                <span className="nav-word"><span className="nav-initial">I</span>nicio</span>
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/peliculas" className="nav-link">
                                <span className="nav-word"><span className="nav-initial">P</span>elículas</span>
                            </Link>
                        </li>

                        {store.auth ? (
                            // Si está logueado
                            <>
                                <li className="nav-item">
                                    <Link to="/profile" className="nav-link">
                                        <span className="nav-word"><span className="nav-initial">P</span>erfil</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/favoritos" className="nav-link">
                                        <span className="nav-word"><span className="nav-initial">F</span>avoritos</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/watched" className="nav-link">
                                        <span className="nav-word"><span className="nav-initial">P</span>elículas</span> <span className="nav-word"><span className="nav-initial">v</span>istas</span>
                                    </Link>
                                </li>
                                <li className="nav-item d-flex align-items-center">
                                    <button
                                        className="btn btn-danger btn-3d nav-btn"
                                        onClick={handleLogout}
                                    >
                                        Cerrar sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            // Si NO está logueado
                            <>
                                <li className="nav-item">
                                    <Link to="/register" className="nav-link">
                                        <span className="nav-word"><span className="nav-initial">R</span>egister</span>
                                    </Link>
                                </li>
                                <li className="nav-tiem">
                                    <Link to="/login" className="nav-link">
                                        <span className="nav-word"><span className="nav-initial">L</span>ogin</span>
                                    </Link>
                                </li>
                            </>
                        )}


                    </ul>
                </div>
            </div>
        </nav>
    );
};