import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import userServices from "../services/userServices";




const ResetPassword =() =>{
    const [password,setPassword] = useState("")
    const [message,setMessage] = useState(null)
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()

    const handleSubmit = async(e) =>{
        e.preventDefault();

        try {
            const data = await userServices.updatePassword(password,token)
            if(data.success){
                alert("Contraseña Actualizada,Inicia Sesion")
                navigate("/")
            }else{
                setMessage("Error al Actualizar la contraseña")
            }    

        } catch (error) {
            console.log("error",error)
            
        };

        
    };


    return(
        <div className="container">
            <h2>Restablece tu contraseña</h2>
            <form onSubmit={handleSubmit}>
                <input 
                type="password"
                placeholder="Nueva Contraseña"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                 />
                 <button type="submit">Guardar Nueva Contraseña</button>
            </form>
            {message && <p>{message}</p>}
        </div>

    )
}
export default ResetPassword;