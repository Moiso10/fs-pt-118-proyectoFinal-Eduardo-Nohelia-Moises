import { useState } from "react"
import userServices from "../services/userServices"





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

        <div className="container">
            <h2>Recuperar Contraseña</h2>

            <form onSubmit={handleSubmit}>
                <input 
                type="email"
                placeholder="Introduce tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                 />
                 <button type="submit">Enviar Instrucciones</button>
                 {message && <p>{message}</p>}
            </form>
        </div>

    );
};
export default ForgotPassword;