import { Link, useNavigate } from "react-router-dom";
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
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <Link to="/" className="navbar-brand mb-0 h1">
                    React Boilerplate
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
                            <Link to="/" className="nav-link">Inicio</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/peliculas" className="nav-link">Películas</Link>
                        </li>

                        {store.auth ? (
					// Si está logueado
					<>
						<li className="nav-item">
							<Link to="/profile" className="nav-link">Perfil</Link>
						</li>
						<button 
							className="btn btn-danger"
							onClick={handleLogout}
						>
							Cerrar sesión
						</button>
					</>
				) : (
					// Si NO está logueado
					<>
						<li className="nav-item">
							<Link to="/register" className="nav-link">Register</Link>
						</li>
						<li className="nav-tiem">
							<Link to ="/login" className="nav-link">Login</Link>
						</li>
					</>
				)}

                        
                       
                        
                    </ul>
                </div>
            </div>
        </nav>
    );
};