import { useState } from "react";
import cloudinaryServices from "../services/cloudinaryServices.jsx";

function CloudinaryComponent({onUploadSuccess}) {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
    };

    return (
        <div style={{ padding: 30 }}>
            <h2>Subir imagen a Cloudinary</h2>
            <h3>la direccion de la imagen almacenada la tienes en la respuesta del fetch</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setFile(e.target.files[0]);
                        setUrl("");
                        setError("");
                    }}
                />
                <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
                    {loading ? "Subiendo..." : "Subir"}
                </button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {response && (
                <div>
                    <p>direccion de imagen en calendly:</p>
                    <p>{response.url}</p>
                </div>
            )}
            {url && (
                <div style={{ marginTop: 20 }}>
                    <p>Imagen subida:</p>
                    <img src={url} alt="Uploaded" width="300" />
                    <p>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            Abrir en nueva pestaña
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
}

export default CloudinaryComponent;