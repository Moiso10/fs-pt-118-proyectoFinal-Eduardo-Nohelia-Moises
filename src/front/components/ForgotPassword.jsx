import { useState } from "react"
import { Link } from "react-router-dom"
import userServices from "../services/userServices"
import "./ForgotPassword.css"





const ForgotPassword = () =>{

    const [email,setEmail] = useState("")
    const [message,setMessage] = useState(null)

    const handleSubmit = async(e) =>{
        e.preventDefault();

        const data = await userServices.checkMail(email)
        if(data){
            setMessage("Se ha enviando un correo con instrucciones")
        }else{
            setMessage("Correo no encontrado")
        };

    };




    return (
        <div className="forgot-container">
            <form onSubmit={handleSubmit} className="forgot-form">
                <h2 className="title-form">Recuperar Contraseña</h2>

                <input 
                  type="email"
                  placeholder="Introduce tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit">Enviar Instrucciones</button>

                {message && <p className="status-message">{message}</p>}

                <p className="back-to-login">
                  <Link to="/login" className="auth-link">Volver a iniciar sesión</Link>
                </p>
            </form>
        </div>
    );
};
export default ForgotPassword;