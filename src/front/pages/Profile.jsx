// src/front/pages/Profile.jsx
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "/src/front/pages/profile.css";
import userServices from "../services/userServices";
import CloudinaryComponent from "../components/cloudinary.component";
import { useNavigate } from "react-router-dom";






const Profile = () => {
  const { store, dispatch } = useGlobalReducer()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email:store.profile.user?.email || "",
    username:  store.profile?.username ||  "",
    avatar: store.profile?.avatar || "",
    preference: store.profile?.preference || ""
  })

 

  
  if (!store.profile) {
    return <p>Cargando perfil...</p>;
  }

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value })
  };


  const handleSave = async (e) => {
    e.preventDefault()

    try {

      const data = await userServices.updateProfile(formData)

      if (data.success) {
        dispatch({ type: "update_user_profile", payload: data.profile })
        alert("profile update success")
      }

    } catch (error) {
      console.log("error updating profile", error)

    }


  }

  const handleDelete = async () => {
  if (!confirm("¿Seguro que deseas eliminar tu cuenta?")) return;

  try {
    const data = await userServices.deleteAccount();

      localStorage.removeItem("token");
      dispatch({ type: "user_logged_out" });
      navigate("/login");
   
  } catch (error) {
    console.log("Error eliminando la cuenta", error);
  }
  
};

  



  return (
    <div className="profile-container">
      <h2 className="title">
        PERFIL<span>USUARIO</span>
      </h2>
      <div className="profile-card">
        <div className="avatar-section">
          <img src={formData.avatar} alt="Avatar" className="avatar" />
          <CloudinaryComponent
            onUploadSuccess={(url) => {
              setFormData({ ...formData, avatar: url });
              alert("Imagen subida correctamente");
            }}
          />
          <p>Avatar</p>
        </div>

        <div className="info-section">
          <label>Email</label>
          <input type="email" value={formData.email} disabled />

          <label>Alias</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Preferencias (género)</label>
          <input
            type="text"
            name="preference"
            value={formData.preference}
            onChange={handleChange}
          />

          <div className="buttons">
            <button onClick={handleSave} className="btn save">Guardar Cambios</button>
            <button onClick={handleDelete} className="btn delete">Eliminar Cuenta</button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                dispatch({ type: "user_logged_out" });
                navigate("/")
              }}
              className="btn btn-danger btn-3d logout"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile