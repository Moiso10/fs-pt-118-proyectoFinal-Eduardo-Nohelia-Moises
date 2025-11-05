import React, { useState } from "react"
import "./Auth.css"
import useGlobalReducer from "../../../hooks/useGlobalReducer"
import { useNavigate } from "react-router-dom"
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
                    const u = data?.data || {}
                    const payload = {
                        id: u?.id ?? null,
                        email: u?.email ?? "",
                        username: (u?.profile?.username) ?? (u?.email ? u.email.split('@')[0] : ""),
                        avatar: u?.profile?.avatar ?? "",
                        preference: u?.profile?.preference ?? ""
                    }
                    dispatch({ type: "save_user", payload })
                    dispatch({ type: "user_logged_in"})
                    navigate("/")
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






            </form>
        </div>

    )
}

export default Auth