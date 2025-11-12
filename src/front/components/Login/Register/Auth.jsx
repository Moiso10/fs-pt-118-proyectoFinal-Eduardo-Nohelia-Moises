import React, { useState } from "react"
import "./Auth.css"
import useGlobalReducer from "../../../hooks/useGlobalReducer"
import { useNavigate, Link } from "react-router-dom"
import userServices from "../../../services/userServices"



const Auth = ({mode}) =>{

    const {store,dispatch} = useGlobalReducer()
    const navigate = useNavigate()
    const login = mode === "login"
    const [formData,setFormData] = useState({
        email:"",
        password:""
    })

    

    const handleChange = e =>{
        const {name,value} = e.target;
        setFormData({...formData, [name]:value})
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()

        try {
            let data;

            if(login) {

                data = await userServices.login({
                    email:formData.email,
                    password:formData.password
                })

                if(data?.success){
                    localStorage.setItem("token",data.token);
                    localStorage.setItem("profile", JSON.stringify(data.data.profile))
                    dispatch({ type: "set_user", payload: data.data.profile})
                    navigate("/")
                    console.log(data)
                }
            }else {

                data = await userServices.register({
                    email: formData.email,
                    password:formData.password
                })
                if(data?.success){
                    alert("Register success, login now")
                    navigate("/login")
                }
            }
        } catch (error) {
            console.log("error", error)
            
        }
    }
  


    return(
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2 className="title-form"> {login ? "Login" : "Register"}</h2>

                <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                 />

                 <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                 />

                 <button type="submit">{ login ? "Login" : "Register"}</button>

                 <div className="auth-switch">
                   {login ? (
                     <span>
                       ¿No tienes cuenta? {" "}
                       <Link to="/register" className="auth-link">Regístrate</Link>
                     </span>
                   ) : (
                     <span>
                       ¿Ya tienes cuenta? {" "}
                       <Link to="/login" className="auth-link">Inicia sesión</Link>
                     </span>
                   )}
                 </div>
                 {login && (
          <p className="forgot-password">
            <Link to="/forgot-password" className="auth-link">¿Olvidaste tu contraseña?</Link>
          </p>
        )}





            </form>
        </div>

    )
}

export default Auth