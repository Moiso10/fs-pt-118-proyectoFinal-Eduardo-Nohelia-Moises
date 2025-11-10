import { useEffect, useState } from "react";
import "./cloudinary.component.css";
import cloudinaryServices from "../services/cloudinaryServices.jsx";

function CloudinaryComponent({ onUploadSuccess,initialImage  }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(initialImage || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState(null);



    useEffect(() => {
        const handleSubmit = async () => {
            setError("");
            if (!file) return setError("Selecciona una imagen");

            try {
                setLoading(true);
                const data = await cloudinaryServices.uploadImage(file);
                setPreview(data.url);
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


    }, [file])

    return (
        <div className="cloudinary-wrapper">
            <label htmlFor="file-upload" className="avatar-container">
        {loading ? (
          <div className="uploading-overlay">
            <div className="spinner"></div>
            <p>Subiendo imagen...</p>
          </div>
        ) : (
          <img
            src={preview}
            alt="Avatar"
            className="avatar"
          />
        )}
      </label>



            <input
                type="file"
                accept="image/*"
                className="upload-input"
                onChange={(e) => {
                    setFile(e.target.files[0]);
                    setPreview("");
                    setError("");

                }}
            />
           


            {error && <p className="cloudinary-error">{error}</p>}

        </div>
    );
}

export default CloudinaryComponent;