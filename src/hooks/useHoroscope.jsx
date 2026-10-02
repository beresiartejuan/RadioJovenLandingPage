import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

const API_URL = "/api/horoscope";

export function useHoroscope() {
    const { token, signOut } = useAuth();

    const [horoscope, setHoroscope] = useState({
        title: '',
        content: '',
        published: true,
        image: '' // URL de la imagen del horóscopo
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChangeEvent = (e) => {
        const { name, value } = e.target;

        setHoroscope(prevHoroscope => ({
            ...prevHoroscope,
            [name]: value
        }));
    };

    // Headers de autorización con el token de la sesión
    const authHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token?.value ?? token}`
    }), [token]);

    const fetchHoroscope = useCallback(async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST'
            });
            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
                throw new Error("Error al obtener el horóscopo");
            }
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
    }, [signOut]);

    const updateHoroscope = async () => {
        setLoading(true);
        setError(null);

        try {
            // El backend espera JSON con imageUrl: los campos vacíos ('') conservan
            // el valor previo guardado. `image` es ahora la URL como string.
            const response = await fetch(`${API_URL}/edit`, {
                method: 'POST',
                headers: {
                    ...authHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: horoscope.title,
                    content: horoscope.content,
                    imageUrl: horoscope.image
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    signOut();
                }
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
    }, [fetchHoroscope]);

    return { horoscope, handleChangeEvent, updateHoroscope, loading, error };
}
