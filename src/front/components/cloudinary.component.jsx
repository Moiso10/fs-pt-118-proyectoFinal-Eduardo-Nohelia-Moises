import { useEffect, useState } from "react";
import "./cloudinary.component.css";
import cloudinaryServices from "../services/cloudinaryServices.jsx";

function CloudinaryComponent({onUploadSuccess}) {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState(null);

   

    useEffect(()=>{
        const handleSubmit = async() =>{
             setError("");
        if (!file) return setError("Selecciona una imagen");

        try {
            setLoading(true);
            const data = await cloudinaryServices.uploadImage(file);
            setUrl(data.url);
            setResponse(data);
            if (onUploadSuccess) onUploadSuccess(data.url);
        } catch (err) {
            console.error(err);
            setError("Error al subir la imagen: " + (err.message || err));
        } finally {
            setLoading(false);
        }
        }
        
        if (file) {
            handleSubmit()

            
        }


    },[file])

    return (
        <div className="cloudinary-wrapper">
            
            
           
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setFile(e.target.files[0]);
                        setUrl("");
                        setError("");
                    }}
                />
            

            {error && <p className="cloudinary-error">{error}</p>}
           
        </div>
    );
}

export default CloudinaryComponent;