import { useEffect, useState } from "react";

const API_URL = "http://localhost:8000/api";

export function useHoroscope() {

    const [horoscope, setHoroscope] = useState({
        title: '',
        content: '',
        published: true,
        image: '' // Almacenamos el archivo de imagen aquí
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChangeEvent = (e) => {
        const { name, value, files } = e.target;

        // Verificar si es el campo de archivo
        if (name === "image" && files.length > 0) {
            setHoroscope(prevHoroscope => ({
                ...prevHoroscope,
                image: files[0]
            }));
        } else {
            setHoroscope(prevHoroscope => ({
                ...prevHoroscope,
                [name]: value
            }));
        }

        console.log(horoscope)
    };

    const fetchHoroscope = async () => {
        try {
            const response = await fetch(`${API_URL}/horoscope`, {
                method: 'POST'
            });
            const data = await response.json();

            setHoroscope(prevData => ({
                ...prevData,
                title: data?.title || '',
                content: data?.content || '',
                image: data?.image || ''
            }));
        } catch (error) {
            console.error("Error fetching horoscope:", error);
            setError("Error al obtener el horóscopo");
        }
    };

    const updateHoroscope = async () => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", horoscope.title);
            formData.append("content", horoscope.content);

            // Adjuntamos la imagen si existe, o un string vacío si no hay imagen
            if (horoscope.image instanceof File) {
                formData.append("image", horoscope.image || "");
            }

            const response = await fetch(`${API_URL}/horoscope/edit`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${window.localStorage.getItem('_auth')}`
                }
            });

            console.log(await response.json());

            if (!response.ok) {
                throw new Error("Error al actualizar el horóscopo");
            }
            alert("Horóscopo actualizado con éxito");
        } catch (error) {
            console.error(error);
            setError("Error al actualizar el horóscopo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHoroscope();
    }, []);

    return { horoscope, handleChangeEvent, updateHoroscope, loading, error };
}
